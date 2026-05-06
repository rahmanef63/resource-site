"use client"

/**
 * Agent Chat Container
 * 
 * A shared, dynamic AI chat container that can be used across all features.
 * Provides consistent UI/UX matching the AI feature's chat interface.
 * 
 * Features:
 * - Recent chats panel with session management
 * - Full Grok-style chat interface
 * - Debug panel for tracking AI responses
 * - Context-aware agent routing
 * - Attachment support
 * - Message regeneration and branching
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { toast } from "sonner"
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  Bug, 
  Settings2, 
  Plus,
  Sparkles,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  GrokUserMessage,
  GrokAIMessage,
  GrokTypingIndicator,
  GrokChatContainer,
  GrokInput,
} from "@/frontend/shared/communications/components/grok-chat"
import { Response } from "@/frontend/shared/communications/components/ai"
import { useSubAgentRouter } from "@/frontend/shared/ai/hooks"
import { subAgentRegistry } from "@/frontend/shared/ai/agent/registry"
import type { AgentSuggestion } from "@/frontend/shared/ai/agent/types"
import { useSessionDebugStore } from "@/frontend/shared/ui/components/session-info/debug-store"
import { SessionInfoTabs } from "@/frontend/shared/ui/components/session-info"

import { RecentChatsPanel } from "./RecentChatsPanel"
import { useAgentChatStore } from "./store"
import type { 
  AgentChatContainerProps, 
  ChatMessage, 
  ChatSession,
  RecentChatItem 
} from "./types"

// ============================================================================
// Welcome Mode Component
// ============================================================================

interface WelcomeModeProps {
  featureId: string
  welcomeMessage?: string
  suggestions?: string[] | AgentSuggestion[]
  onSuggestionClick: (prompt: string) => void
}

/** Normalize suggestion inputs (string | AgentSuggestion) to AgentSuggestion[]. */
function normalizeSuggestions(
  input: string[] | AgentSuggestion[] | undefined,
): AgentSuggestion[] {
  if (!input || input.length === 0) return []
  if (typeof input[0] === "string") {
    return (input as string[]).map((s) => ({ label: s, prompt: s }))
  }
  return input as AgentSuggestion[]
}

function WelcomeMode({
  featureId,
  welcomeMessage,
  suggestions,
  onSuggestionClick,
}: WelcomeModeProps) {
  const agent = useMemo(() => {
    return subAgentRegistry.getAllAgents().find(a => a.featureId === featureId)
  }, [featureId])

  const resolvedSuggestions = useMemo<AgentSuggestion[]>(() => {
    // 1. Explicit prop wins
    const fromProp = normalizeSuggestions(suggestions)
    if (fromProp.length > 0) return fromProp

    // 2. Registry lookup (SSOT — features register via agent/index.ts)
    const fromRegistry = subAgentRegistry.getSuggestions(featureId)
    if (fromRegistry.length > 0) return fromRegistry

    // 3. Minimal generic fallback so welcome screen is never empty
    return [
      { label: "What can you help me with?", prompt: "What can you help me with?" },
      { label: "Show me what's new", prompt: "Show me what's new" },
      { label: "Help me get started", prompt: "Help me get started" },
    ]
  }, [featureId, suggestions])

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      {/* Logo/Icon */}
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      
      {/* Title */}
      <h2 className="text-xl font-semibold mb-2">
        {agent?.name || "AI Assistant"}
      </h2>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
        {welcomeMessage || agent?.description || "How can I help you today?"}
      </p>
      
      {/* Suggestions */}
      <div className="w-full max-w-md space-y-2">
        {resolvedSuggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.prompt)}
            className={cn(
              "w-full text-left p-3 rounded-lg border border-border",
              "hover:bg-accent hover:border-primary/20 transition-colors",
              "text-sm text-foreground"
            )}
          >
            {s.label}
            {s.category && (
              <span className="ml-2 text-xs text-muted-foreground">· {s.category}</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tools count */}
      {agent && agent.tools.length > 0 && (
        <div className="mt-6 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {agent.tools.length} tools available
          </Badge>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Message List Component
// ============================================================================

interface MessageListComponentProps {
  messages: ChatMessage[]
  isSending: boolean
  isRegenerating: boolean
  messageBranches: Record<string, Array<{ id: string; content: string; timestamp: number }>>
  aiSuggestions: string[]
  onRegenerate: (msgId: string, content: string) => void
  onReply: (content: string) => void
  onListen: (content: string) => void
  onThumbsUp: (msgId: string) => void
  onThumbsDown: (msgId: string) => void
  onSuggestionClick: (suggestion: string) => void
}

function MessageListComponent({
  messages,
  isSending,
  isRegenerating,
  messageBranches,
  aiSuggestions,
  onRegenerate,
  onReply,
  onListen,
  onThumbsUp,
  onThumbsDown,
  onSuggestionClick,
}: MessageListComponentProps) {
  return (
    <GrokChatContainer>
      {messages.map((msg, index) => {
        const isUser = msg.role === "user"
        const isLastAIMessage = !isUser && index === messages.length - 1
        const msgId = msg.id || `msg-${index}`
        const branches = messageBranches[msgId]

        if (isUser) {
          return (
            <GrokUserMessage key={msgId}>
              {msg.content}
            </GrokUserMessage>
          )
        }

        // Use AI-generated suggestions for the last AI message
        const followUpSuggestions = isLastAIMessage && !isSending
          ? (aiSuggestions.length > 0 ? aiSuggestions : undefined)
          : undefined

        const duration = msg.metadata?.duration ? msg.metadata.duration / 1000 : undefined

        return (
          <GrokAIMessage
            key={msgId}
            responseTime={duration}
            speedLabel={duration && duration < 2 ? "Fast" : "Normal"}
            branches={branches}
            onRegenerate={() => onRegenerate(msgId, msg.content)}
            onReply={() => onReply(msg.content)}
            onListen={() => onListen(msg.content)}
            onShare={() => {
              navigator.clipboard.writeText(msg.content)
              toast.success("Copied to clipboard")
            }}
            onThumbsUp={() => onThumbsUp(msgId)}
            onThumbsDown={() => onThumbsDown(msgId)}
            onMore={() => toast.info("Report feedback sent. Thank you!")}
            feedback={msg.feedback}
            suggestions={followUpSuggestions}
            onSuggestionClick={onSuggestionClick}
            isRegenerating={isRegenerating}
            reasoning={msg.metadata?.reasoning}
            isStreamingReasoning={isLastAIMessage && isSending}
          >
            <Response>{msg.content}</Response>
          </GrokAIMessage>
        )
      })}

      {/* Typing indicator */}
      {isSending && <GrokTypingIndicator />}
    </GrokChatContainer>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentChatContainer({
  featureId,
  sessionId,
  session: externalSession,
  onSessionCreate,
  onSessionSelect,
  placeholder,
  context,
  showRecentChats = true,
  showDebugPanel = true,
  welcomeMessage,
  suggestions,
  className,
  variant = "full",
  headerComponent,
  onMessageSend,
  onBeforeSend,
  onMessageReceive,
  knowledgeEnabled,
  knowledgeContext,
}: AgentChatContainerProps) {
  // ============================================================================
  // State
  // ============================================================================
  
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [messageBranches, setMessageBranches] = useState<Record<string, Array<{ id: string; content: string; timestamp: number }>>>({})
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [showLeftPanel, setShowLeftPanel] = useState(showRecentChats)
  const [showRightPanel, setShowRightPanel] = useState(false)

  // Store
  const store = useAgentChatStore()
  const messages = store.messages
  
  // Debug store
  const debugStore = useSessionDebugStore()
  
  // Agent router
  const { 
    processQuery, 
    generateChat, 
    getAgentSystemPrompt,
    isProcessing: isAgentProcessing,
    lastToolUsed
  } = useSubAgentRouter()

  // Get agent for this feature
  const agent = useMemo(() => {
    return subAgentRegistry.getAllAgents().find(a => a.featureId === featureId)
  }, [featureId])

  // Get recent chats
  const recentChats = store.getRecentChats(featureId)

  // Current session
  const currentSession = externalSession || store.currentSession

  // ============================================================================
  // Effects
  // ============================================================================

  // Sync external session to store
  useEffect(() => {
    if (externalSession) {
      store.setCurrentSession(externalSession as ChatSession)
    }
  }, [externalSession])

  // Show toast when tool is executing
  useEffect(() => {
    if (isAgentProcessing && lastToolUsed) {
      toast.loading(`Running: ${lastToolUsed}...`, {
        id: "agent-tool-execution",
      })
    } else if (!isAgentProcessing && lastToolUsed) {
      toast.dismiss("agent-tool-execution")
    }
  }, [isAgentProcessing, lastToolUsed])

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return
    if (isSending) return

    const messageContent = input.trim()
    const messageId = `user-${Date.now()}`

    // Create user message
    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: replyingTo 
        ? `> ${replyingTo.substring(0, 200)}${replyingTo.length > 200 ? '...' : ''}\n\n${messageContent}`
        : messageContent,
      timestamp: Date.now(),
      metadata: {
        attachments: attachments.map(f => ({
          id: Math.random().toString(36).substring(2, 15),
          name: f.name,
          type: f.type,
          size: f.size,
          status: "pending" as const,
        })),
      },
    }

    // Add to store
    store.addMessage(userMessage)
    
    // Clear input
    setInput("")
    setAttachments([])
    setReplyingTo(null)
    setIsSending(true)

    // Log to debug store
    const traceId = debugStore.addAgentTrace({
      timestamp: Date.now(),
      agentId: agent?.id || "general",
      agentName: agent?.name || "General Assistant",
      query: messageContent,
      confidence: 1,
      status: "processing",
    })

    try {
      // Custom handler if provided
      if (onMessageSend) {
        await onMessageSend(messageContent, attachments)
        return
      }

      // onBeforeSend intercept — stored user message stays raw, agent sees enriched.
      const agentPrompt = onBeforeSend
        ? await Promise.resolve(onBeforeSend(messageContent))
        : messageContent

      // Build chat history
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      history.push({ role: "user", content: agentPrompt })

      // Get system prompt
      let systemPrompt = "You are a helpful AI assistant."
      if (agent) {
        const agentSystemPrompt = await getAgentSystemPrompt(agent.id)
        if (agentSystemPrompt) systemPrompt = agentSystemPrompt
      }

      // Add context if provided
      if (context) {
        systemPrompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`
      }

      // Add knowledge context if enabled
      if (knowledgeEnabled && knowledgeContext) {
        systemPrompt += `\n\nKnowledge:\n${knowledgeContext}`
      }

      const startTime = Date.now()
      
      // Generate response
      const response = await generateChat(history, systemPrompt)

      const duration = Date.now() - startTime

      if (!response) {
        throw new Error("No response from AI")
      }

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        metadata: {
          duration,
          agentId: agent?.id,
          model: "auto",
        },
      }

      // Add to store
      store.addMessage(aiMessage)

      // Callback
      onMessageReceive?.(aiMessage)

      // Update debug trace
      debugStore.completeAgentTrace(traceId, response)

      // Update recent chats
      const chatItem: RecentChatItem = {
        _id: currentSession?._id || `temp-${Date.now()}`,
        title: currentSession?.title || messageContent.substring(0, 50),
        lastMessage: response.substring(0, 100),
        timestamp: Date.now(),
        featureId,
        messageCount: messages.length + 2,
      }
      store.addRecentChat(featureId, chatItem)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      toast.error(errorMessage)
      
      // Log error
      debugStore.completeAgentTrace(traceId, undefined, errorMessage)
      debugStore.log("error", "AgentChat", errorMessage, { error })

    } finally {
      setIsSending(false)
    }
  }, [
    input, 
    attachments, 
    replyingTo, 
    isSending, 
    messages, 
    agent, 
    context, 
    knowledgeEnabled, 
    knowledgeContext,
    currentSession,
    featureId,
    onMessageSend,
    onBeforeSend,
    onMessageReceive,
    generateChat,
    getAgentSystemPrompt,
    debugStore,
    store,
  ])

  const handleRegenerate = useCallback(async (msgId: string, originalContent: string) => {
    if (isRegenerating) return
    
    setIsRegenerating(true)
    
    const traceId = debugStore.addAgentTrace({
      timestamp: Date.now(),
      agentId: agent?.id || "general",
      agentName: agent?.name || "General Assistant",
      query: "[Regenerate]",
      confidence: 1,
      status: "processing",
    })

    try {
      // Find the user message before this AI response
      const msgIndex = messages.findIndex(m => m.id === msgId)
      const userMessages = messages.slice(0, msgIndex).filter(m => m.role === "user")
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (!lastUserMessage) {
        throw new Error("No user message found to regenerate from")
      }

      // Build history up to that point
      const history = messages
        .slice(0, msgIndex)
        .map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))

      // Get system prompt
      let systemPrompt = "You are a helpful AI assistant."
      if (agent) {
        const agentSystemPrompt = await getAgentSystemPrompt(agent.id)
        if (agentSystemPrompt) systemPrompt = agentSystemPrompt
      }

      const startTime = Date.now()
      
      // Generate new response
      const response = await generateChat(history, systemPrompt)
      
      const duration = Date.now() - startTime

      if (!response) {
        throw new Error("Failed to regenerate response")
      }

      // Add to branches
      setMessageBranches(prev => {
        const existing = prev[msgId] || [
          { id: msgId, content: originalContent, timestamp: Date.now() }
        ]
        return {
          ...prev,
          [msgId]: [
            ...existing,
            { id: `branch-${Date.now()}`, content: response, timestamp: Date.now() }
          ],
        }
      })

      // Update debug trace
      debugStore.completeAgentTrace(traceId, response)

      toast.success("Response regenerated")

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate"
      toast.error(errorMessage)
      debugStore.completeAgentTrace(traceId, undefined, errorMessage)
    } finally {
      setIsRegenerating(false)
    }
  }, [isRegenerating, messages, agent, generateChat, getAgentSystemPrompt, debugStore])

  const handleReply = useCallback((content: string) => {
    setReplyingTo(content)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleListen = useCallback((content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content)
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Text-to-speech not supported")
    }
  }, [])

  const handleThumbsUp = useCallback((msgId: string) => {
    store.updateMessage(msgId, { feedback: "up" })
    toast.success("Thanks for the feedback!")
  }, [store])

  const handleThumbsDown = useCallback((msgId: string) => {
    store.updateMessage(msgId, { feedback: "down" })
    toast.info("Thanks for the feedback!")
  }, [store])

  const handleAttach = useCallback((files: FileList) => {
    setAttachments(prev => [...prev, ...Array.from(files)])
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion)
  }, [])

  const handleNewChat = useCallback(() => {
    store.clearMessages()
    store.setCurrentSession(null)
    onSessionCreate?.({
      _id: `temp-${Date.now()}`,
      title: "New Chat",
      status: "active",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      featureId,
    })
  }, [store, onSessionCreate, featureId])

  const handleSessionSelect = useCallback((id: string) => {
    onSessionSelect?.(id)
    // In a real implementation, this would load the session from the backend
    store.setCurrentSessionId(id)
  }, [onSessionSelect, store])

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const hasMessages = messages.length > 0

  // Convert current session to GenericSession for SessionInfoTabs
  // Use type assertion since our ChatMessage is compatible with SessionMessage
  const genericSession = useMemo(() => {
    if (!currentSession) return null
    return {
      _id: currentSession._id,
      title: currentSession.title,
      icon: currentSession.icon,
      status: currentSession.status,
      messages: currentSession.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        metadata: m.metadata as any,
      })),
      createdAt: currentSession.createdAt,
      updatedAt: currentSession.updatedAt,
      metadata: currentSession.metadata,
    } as any // Type assertion for compatibility
  }, [currentSession])

  // ============================================================================
  // Compact Variant (Single Panel)
  // ============================================================================

  if (variant === "compact" || variant === "panel") {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        {headerComponent || (
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{agent?.name || "AI Assistant"}</span>
            </div>
            {showDebugPanel && (
              <Button
                variant={showRightPanel ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowRightPanel(!showRightPanel)}
              >
                <Bug className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {hasMessages ? (
              <MessageListComponent
                messages={messages}
                isSending={isSending}
                isRegenerating={isRegenerating}
                messageBranches={messageBranches}
                aiSuggestions={aiSuggestions}
                onRegenerate={handleRegenerate}
                onReply={handleReply}
                onListen={handleListen}
                onThumbsUp={handleThumbsUp}
                onThumbsDown={handleThumbsDown}
                onSuggestionClick={handleSuggestionClick}
              />
            ) : (
              <WelcomeMode
                featureId={featureId}
                welcomeMessage={welcomeMessage}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}

            {/* Input */}
            <GrokInput
              value={input}
              onChange={setInput}
              onSubmit={handleSendMessage}
              placeholder={placeholder || `Ask ${agent?.name || "AI"}...`}
              disabled={isSending}
              attachments={attachments}
              onAttach={handleAttach}
              onRemoveAttachment={handleRemoveAttachment}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
          </div>

          {/* Debug Panel */}
          {showRightPanel && showDebugPanel && genericSession && (
            <div className="w-80 border-l">
              <SessionInfoTabs
                session={genericSession}
                onClose={() => setShowRightPanel(false)}
                defaultTab="debug"
                tabs={["overview", "debug"]}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // Full Variant (3-Column)
  // ============================================================================

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Left Panel - Recent Chats */}
      {showRecentChats && showLeftPanel && (
        <div className="w-64 border-r flex-shrink-0">
          <RecentChatsPanel
            featureId={featureId}
            sessions={recentChats}
            selectedSessionId={currentSession?._id}
            onSessionSelect={handleSessionSelect}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Center - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            {showRecentChats && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowLeftPanel(!showLeftPanel)}
              >
                {showLeftPanel ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
            )}
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {currentSession?.title || agent?.name || "AI Assistant"}
            </span>
            {agent && (
              <Badge variant="secondary" className="text-[10px]">
                {agent.tools.length} tools
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showDebugPanel && (
              <Button
                variant={showRightPanel ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowRightPanel(!showRightPanel)}
                title="Toggle Debug Panel"
              >
                <Bug className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNewChat}
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages / Welcome */}
        {hasMessages ? (
          <MessageListComponent
            messages={messages}
            isSending={isSending}
            isRegenerating={isRegenerating}
            messageBranches={messageBranches}
            aiSuggestions={aiSuggestions}
            onRegenerate={handleRegenerate}
            onReply={handleReply}
            onListen={handleListen}
            onThumbsUp={handleThumbsUp}
            onThumbsDown={handleThumbsDown}
            onSuggestionClick={handleSuggestionClick}
          />
        ) : (
          <WelcomeMode
            featureId={featureId}
            welcomeMessage={welcomeMessage}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {/* Input */}
        <GrokInput
          value={input}
          onChange={setInput}
          onSubmit={handleSendMessage}
          placeholder={placeholder || `Ask ${agent?.name || "AI"}...`}
          disabled={isSending}
          attachments={attachments}
          onAttach={handleAttach}
          onRemoveAttachment={handleRemoveAttachment}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>

      {/* Right Panel - Debug/Info */}
      {showRightPanel && showDebugPanel && (
        <div className="w-80 border-l flex-shrink-0">
          {genericSession ? (
            <SessionInfoTabs
              session={genericSession}
              onClose={() => setShowRightPanel(false)}
              defaultTab="debug"
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation to see debug info</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
