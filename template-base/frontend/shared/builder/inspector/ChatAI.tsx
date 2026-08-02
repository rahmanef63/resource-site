import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Send, Bot, User, Sparkles, Lightbulb, MousePointer } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatAIProps {
  selectedNode: any | null;
  /** Controlled messages — when provided, component is "controlled" */
  messages?: Message[];
  onMessagesChange?: (m: Message[]) => void;
  /** Project-wide context mode (no selected node context) */
  projectMode?: boolean;
  /**
   * Injected AI generate function from the host feature (e.g. Studio).
   * Receives the user message + system prompt, returns the AI response string or null.
   * When not provided, the component falls back to a stub response.
   */
  onAIGenerate?: (prompt: string, systemPrompt: string) => Promise<string | null>;
  /** Called when AI responds with a valid JSON props patch — host applies it to the node. */
  onApplyProps?: (nodeId: string, patchedProps: Record<string, unknown>) => void;
}

/** Suggested prompts tailored by component type */
function getSuggestedPrompts(comp: string): string[] {
  const base = [
    'Make it more visually appealing',
    'Change the color to match the brand',
    'Add more spacing around this element',
  ];
  const byType: Record<string, string[]> = {
    button: ['Make the button larger', 'Add an icon to the button', 'Make it a destructive/danger button'],
    text: ['Make the text bold', 'Increase the font size', 'Change to a heading style'],
    heading: ['Make it a hero headline', 'Reduce size to a subheading', 'Center-align the heading'],
    image: ['Add a rounded border', 'Make it full width', 'Add a subtle shadow'],
    input: ['Add a placeholder hint', 'Make it full width', 'Style as a search bar'],
    card: ['Add a shadow', 'Make it more compact', 'Add a hover effect'],
    row: ['Center the children', 'Add gap between elements', 'Make it responsive'],
    column: ['Add padding inside', 'Center-align content', 'Make it a sidebar width'],
    section: ['Add a background color', 'Make it full-screen height', 'Add top/bottom padding'],
  };
  return byType[comp?.toLowerCase()] ?? base;
}

/** Typing dots indicator */
function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-7 h-7 rounded-full bg-primary/80 flex items-center justify-center flex-shrink-0">
        <Bot size={13} className="text-primary-foreground" />
      </div>
      <div className="bg-muted px-3 py-2.5 rounded-lg flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  );
}

/** Simple inline markdown renderer for **bold** and `code` */
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-muted px-1 rounded text-[10px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function ChatAI({ selectedNode, messages: controlledMessages, onMessagesChange, projectMode = false, onAIGenerate, onApplyProps }: ChatAIProps) {
  const comp = selectedNode?.data?.comp || selectedNode?.type || '';

  const modelLabel = React.useMemo(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('superspace:settings:ai') : null;
      if (stored) {
        const p = JSON.parse(stored);
        const provider = p.defaultProvider as string | undefined;
        const model = p.defaultModel as string | undefined;
        if (model) return model;
        if (provider) return provider;
      }
    } catch {}
    return null;
  }, []);

  const initialMessage: Message = {
    id: '1',
    content: projectMode
      ? 'Hi! I can help you with this project — ask about the schema, components, or design decisions.'
      : selectedNode
        ? `Hi! I can help you modify the **${comp}** component. What would you like to change?`
        : 'Hi! Select a component on the canvas, then ask me to help style or modify it.',
    sender: 'ai',
    timestamp: new Date(),
  };

  const [localMessages, setLocalMessages] = useState<Message[]>([initialMessage]);
  const isControlled = controlledMessages !== undefined;
  const messages = isControlled ? controlledMessages : localMessages;

  const setMessages = (updater: Message[] | ((prev: Message[]) => Message[])) => {
    const next = typeof updater === 'function' ? updater(messages) : updater;
    if (isControlled) {
      onMessagesChange?.(next);
    } else {
      setLocalMessages(next);
    }
  };

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: msg,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (onAIGenerate) {
      const currentProps = selectedNode?.data?.props ?? {};
      const systemPrompt = projectMode
        ? `You are a Studio UI assistant helping with a project. Answer questions about schema, components, and design.
Keep answers concise and practical. When suggesting prop changes, return ONLY a JSON object like {"propKey":"newValue"} with no other text.
For general questions return plain text. Never wrap output in markdown fences.`
        : `You are a Studio UI assistant. The user selected a "${comp}" component.
Current props: ${JSON.stringify(currentProps)}.
When the user asks to change something, return ONLY a JSON object with the props to update, e.g. {"backgroundColor":"#1e40af","color":"#ffffff"}.
For questions or explanations return plain text.
Never wrap output in markdown fences. Never include extra commentary alongside JSON.`;

      try {
        const response = await onAIGenerate(msg, systemPrompt);
        setIsTyping(false);

        if (!response) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            content: 'AI is not configured. Go to Settings → AI Builder to enable it.',
            sender: 'ai',
            timestamp: new Date(),
          }]);
          return;
        }

        // Try to parse response as a props patch JSON
        let appliedPatch = false;
        if (!projectMode && selectedNode && onApplyProps) {
          try {
            const trimmed = response.trim();
            // Only try to parse if it looks like a JSON object (not a sentence)
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
              const patch = JSON.parse(trimmed) as Record<string, unknown>;
              onApplyProps(selectedNode.id, { ...currentProps, ...patch });
              appliedPatch = true;
            }
          } catch {
            // Not JSON — treat as plain text reply
          }
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: appliedPatch
            ? `Applied changes to **${comp}**: ${response.trim()}`
            : response,
          sender: 'ai',
          timestamp: new Date(),
        }]);
      } catch {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: 'Something went wrong. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }
    } else {
      // No AI generate function injected — show informative stub
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: projectMode
            ? 'AI is not connected yet. Make sure Studio AI is enabled in Settings → AI Builder.'
            : selectedNode
              ? `AI is not connected yet. Enable it in Settings → AI Builder.`
              : 'Select a component on the canvas first.',
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }, 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const suggestedPrompts = getSuggestedPrompts(comp);
  const canSend = !isTyping && (projectMode ? !!input.trim() : !!input.trim() && !!selectedNode);

  return (
    <div className="h-full flex flex-col">
      {/* Component context card */}
      {!projectMode && (
        selectedNode ? (
          <div className="mx-3 mt-3 mb-2 flex items-center gap-2.5 px-3 py-2 bg-primary/5 border border-primary/15 rounded-lg shrink-0">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles size={12} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">Editing component</p>
              <p className="text-xs font-semibold text-foreground truncate">{comp}</p>
            </div>
          </div>
        ) : (
          <div className="mx-3 mt-3 mb-2 flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border/30 rounded-lg shrink-0">
            <MousePointer size={12} className="text-muted-foreground/50 shrink-0" />
            <p className="text-[10px] text-muted-foreground">Select a component on the canvas to get started</p>
          </div>
        )
      )}

      {/* Active model pill */}
      {modelLabel && (projectMode || selectedNode) && (
        <div className="mx-3 mb-1 flex items-center gap-1.5 text-[9px] text-muted-foreground/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          {modelLabel}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 min-h-0">
        <div className="space-y-3 py-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2.5 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-primary/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={13} className="text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[82%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
              >
                {renderMarkdown(message.content)}
              </div>
              {message.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-muted border border-border/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      {showSuggestions && !projectMode && selectedNode && suggestedPrompts.length > 0 && (
        <div className="px-3 pb-2 space-y-1 shrink-0">
          <div className="flex items-center gap-1 mb-1.5">
            <Lightbulb size={10} className="text-yellow-500" />
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground/60 font-bold">Try asking</span>
          </div>
          <div className="flex flex-col gap-1">
            {suggestedPrompts.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-left px-2.5 py-1.5 rounded-md border border-border/40 bg-background hover:bg-muted/50 hover:border-border transition-all text-[10px] text-muted-foreground hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2 border-t border-border/50 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
            placeholder={
              projectMode
                ? 'Ask about the project...'
                : selectedNode
                  ? `Ask about the ${comp} element...`
                  : 'Select a component first...'
            }
            disabled={!projectMode && !selectedNode}
            className="flex-1 text-xs resize-none min-h-[32px] max-h-[120px] rounded-md border border-input bg-background px-3 py-1.5 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!canSend}
            size="icon"
            className="h-8 w-8 shrink-0 self-end"
          >
            <Send size={13} />
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground/50 px-0.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
