/**
 * AI Detail View - Refactored with AI Elements
 * 
 * Uses shadcn.io AI Elements for ChatGPT-style interface:
 * - Message, MessageContent, AIMessageAvatar, UserMessageAvatar
 * - Response (streaming markdown)
 * - Conversation, ConversationContent, ConversationScrollButton
 * - PromptInput, PromptInputTextarea, PromptInputSubmit
 * - ActionWithFeedback (with click feedback)
 * - Branch, BranchMessages, BranchSelector (for regenerate)
 * - Loader, Suggestion
 * 
 * Integrates with Convex for data persistence and Clerk for user avatars
 */

"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { toast } from "sonner"



// Grok-style UI components
import {
  GrokInput,
} from "@/frontend/shared/communications/components/grok-chat"

// AI Elements type
import type { ChatStatus } from "@/frontend/shared/communications/components/ai"


// Feature imports
import { useAIStore } from "./stores"
import { useAIActions, useSubAgentRouter } from "./hooks"
import { useAIKnowledgeContext } from "@/frontend/shared/ai/hooks/useAIKnowledgeContext"
import { getProviderModels, useAISettingsStorage } from "./settings/useAISettings"
import { useIsMobile } from "@/hooks/use-mobile"
import { AIChatHeader } from "./components/AIChatHeader"
import { AIWelcomeMode } from "./components/AIWelcomeMode"
import { AIMessageList } from "./components/AIMessageList"
import { SessionInfoPanel } from "./components/SessionInfoPanel"
import { generateAISuggestions } from "./utils/suggestions"
import { useAiFetch } from "@/frontend/shared/ai/hooks/useAiFetch"
import { DEFAULT_PROVIDER, DEFAULT_MODEL_ID } from "./constants"
import { AIDebugPanel } from "./components/AIDebugPanel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
interface AIDetailViewProps {
  chatId?: string
  onBack?: () => void
}




export function AIDetailView({ chatId: externalChatId, onBack }: AIDetailViewProps) {
  const [message, setMessage] = useState("")
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true) // Default to open as per user request to see info immediately
  const [messageBranches, setMessageBranches] = useState<Record<string, Array<{ id: string; content: string; timestamp: number }>>>({})
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const isMobile = useIsMobile()

  // AI settings for API calls
  const { settings } = useAISettingsStorage()

  // Shared /api/ai/* fetch chokepoint (injects auth Bearer token)
  const aiFetch = useAiFetch()

  // Zustand store
  const selectedSession = useAIStore((s) => s.selectedSession)
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId)
  const isSending = useAIStore((s) => s.isSending)
  const isLoading = useAIStore((s) => s.isLoading)
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled)
  const setKnowledgeEnabled = useAIStore((s) => s.setKnowledgeEnabled)
  const updateSession = useAIStore((s) => s.updateSession)
  const { sendMessage: sendAIMessage, createSession, selectSession, regenerateMessage, submitFeedback, updateSessionMetadata } = useAIActions()

  // Knowledge context
  const { knowledgeContext } = useAIKnowledgeContext()

  // Access sub-agent router state to show feedback
  const { isProcessing: isAgentProcessing, lastToolUsed, lastAgentUsed } = useSubAgentRouter()

  // Show feedback when tool is executing
  useEffect(() => {
    if (isAgentProcessing && lastToolUsed) {
      toast.loading(`Running tool: ${lastToolUsed}...`, {
        id: "agent-tool-execution",
      })
    } else if (!isAgentProcessing && lastToolUsed) {
      toast.dismiss("agent-tool-execution")
      toast.success(`Completed: ${lastToolUsed}`, {
        duration: 2000
      })
    }
  }, [isAgentProcessing, lastToolUsed])

  // Use external or store chatId
  const chatId = externalChatId ?? storeSelectedSessionId
  const messages = selectedSession?.messages ?? []

  // Chat status for PromptInputSubmit
  const status: ChatStatus = useMemo(() => {
    if (isSending) return "streaming"
    return "ready"
  }, [isSending])

  const handleAttach = useCallback((files: FileList) => {
    setAttachments(prev => [...prev, ...Array.from(files)])
    toast.success(`${files.length} file(s) attached`)
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

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
      toast.error("Text-to-speech not supported in this browser")
    }
  }, [])

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    const contextToUse = knowledgeEnabled ? knowledgeContext : undefined

    // Handle attachments (mock for now)
    let finalMessage = message

    // Handle reply context
    if (replyingTo) {
      const quote = `> ${replyingTo.substring(0, 200)}${replyingTo.length > 200 ? '...' : ''}\n\n`
      finalMessage = `${quote}${finalMessage}`
    }

    if (attachments.length > 0) {
      const fileNames = attachments.map(f => f.name).join(", ")
      finalMessage = `${finalMessage}\n\n[Attached: ${fileNames}]`
      // In a real app, we would upload these files first
    }

    // If no session, create one first
    if (!chatId) {
      const session = await createSession("New Chat")
      if (session) {
        selectSession(session._id)
        await sendAIMessage(finalMessage, contextToUse, session._id, {
          attachments: attachments.map(f => ({
            id: Math.random().toString(36).substring(2, 15),
            name: f.name,
            type: f.type,
            url: "", // Placeholder
            size: f.size,
          })),
          replyTo: replyingTo || undefined,
        })
        setMessage("")
        setAttachments([])
        setReplyingTo(null)
      }
      return
    }

    await sendAIMessage(finalMessage, contextToUse, undefined, {
      attachments: attachments.map(f => ({
        id: Math.random().toString(36).substring(2, 15),
        name: f.name,
        type: f.type,
        url: "", // Placeholder
        size: f.size,
      })),
      replyTo: replyingTo || undefined,
    })
    setMessage("")
    setAttachments([])
    setReplyingTo(null)
  }, [message, attachments, replyingTo, chatId, knowledgeEnabled, knowledgeContext, createSession, selectSession, sendAIMessage])

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }, [])

  const handleThumbsUp = useCallback((messageId?: string) => {
    if (chatId && messageId) {
      submitFeedback(chatId as any, messageId, "up")
      toast.success("Thanks for the feedback!")
    }
  }, [chatId, submitFeedback])

  const handleThumbsDown = useCallback((messageId?: string) => {
    if (chatId && messageId) {
      submitFeedback(chatId as any, messageId, "down")
      toast.info("Thanks for the feedback. We'll improve!")
    }
  }, [chatId, submitFeedback])

  // Regenerate creates a new branch - calls API directly without adding new message
  const handleRegenerate = useCallback(async (originalMessageId: string, originalContent: string) => {
    if (!selectedSession?.messages.length) return

    setIsRegenerating(true)
    try {
      const userMessages = selectedSession.messages.filter(m => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]

      if (!lastUserMessage) return

      // Get AI settings for direct API call
      const providerRaw = settings?.defaultProvider || DEFAULT_PROVIDER
      const provider = providerRaw === "z-ai" ? "glm" : providerRaw
      const configuredModel = settings?.defaultModel || DEFAULT_MODEL_ID
      const availableModels = getProviderModels(provider)
      const model =
        availableModels.length > 0 && !availableModels.some((m) => m.id === configuredModel)
          ? availableModels[0].id
          : configuredModel
      const apiKeyConfig =
        settings?.apiKeys?.find((k: any) => k.providerId === provider && k.isEnabled) ||
        settings?.apiKeys?.find((k: any) => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled)

      if (!apiKeyConfig?.apiKey && provider !== "ollama") {
        toast.error(`No API key configured for ${provider}`)
        return
      }

      // Build messages array for regeneration (without adding new user message)
      const systemMessages: { role: 'system'; content: string }[] = []
      if (knowledgeEnabled && knowledgeContext) {
        systemMessages.push({
          role: 'system',
          content: `You have access to the following knowledge:\n\n${knowledgeContext}`,
        })
      }

      // Find the index of the message being regenerated
      const msgIndex = selectedSession.messages.findIndex(m => m.id === originalMessageId)
      // Get all messages up to and including the user message before this AI response
      const messagesBeforeThis = selectedSession.messages.slice(0, msgIndex).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const messages = [
        ...systemMessages,
        ...messagesBeforeThis,
      ]

      // Call AI API directly for regeneration (no persistence)
      const response = await aiFetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey || "",
          baseUrl: apiKeyConfig?.baseUrl,
          temperature: (settings?.temperature || 0.7) + 0.1, // Slightly higher temp for variation
          maxTokens: parseInt(settings?.maxTokens || "2048"),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      const responseContent = data.content || "Failed to regenerate"

      // Add to branches for this message (local state only, no new message added)
      setMessageBranches(prev => {
        const existing = prev[originalMessageId] || [
          { id: originalMessageId, content: originalContent, timestamp: Date.now() }
        ]
        return {
          ...prev,
          [originalMessageId]: [
            ...existing,
            { id: `branch-${Date.now()}`, content: responseContent, timestamp: Date.now() }
          ]
        }
      })

      // Persist to Convex
      if (chatId) {
        await regenerateMessage(chatId as any, originalMessageId, responseContent)
      }

      toast.success("Response regenerated as new branch")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to regenerate"
      toast.error(errorMessage)
    } finally {
      setIsRegenerating(false)
    }
  }, [selectedSession, knowledgeEnabled, knowledgeContext, settings, aiFetch])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setMessage(suggestion)
  }, [])

  const handleIconChange = useCallback(async (icon: string) => {
    if (chatId && updateSessionMetadata) {
      await updateSessionMetadata(chatId as any, { icon })
      toast.success("Icon updated")
    }
  }, [chatId, updateSessionMetadata])

  const handleAgentSelect = useCallback(async (agentId: string | null) => {
    if (!chatId || !updateSessionMetadata) return;

    // Update session metadata with selected agent
    await updateSessionMetadata(chatId as any, {
      metadata: { agentId: agentId || undefined }
    });

    if (agentId) {
      // Import registry dynamically to avoid cycles if possible, or assume it's available
      // For now, we trust the update will persist.
      // We could also update the icon if the agent has one
      // const agent = subAgentRegistry.getAgent(agentId); 
      // if (agent?.icon) await updateSessionMetadata(chatId as any, { icon: agent.icon });

      toast.success("Agent selected");
    } else {
      toast.success("Switched to General Assistant");
    }
  }, [chatId, updateSessionMetadata]);

  // Generate AI suggestions when last message changes
  const generateSuggestionsForMessage = useCallback(async (content: string) => {
    if (isGeneratingSuggestions) return

    setIsGeneratingSuggestions(true)
    try {
      const providerRaw = settings.defaultProvider || "groq"
      const provider = providerRaw === "z-ai" ? "glm" : providerRaw
      const configuredModel = settings.defaultModel || "llama-3.3-70b-versatile"
      const availableModels = getProviderModels(provider)
      const model =
        availableModels.length > 0 && !availableModels.some((m) => m.id === configuredModel)
          ? availableModels[0].id
          : configuredModel
      const apiKeyConfig =
        settings.apiKeys?.find(k => k.providerId === provider && k.isEnabled) ||
        settings.apiKeys?.find(k => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled)

      if (!apiKeyConfig?.apiKey && provider !== "ollama") {
        // Fallback to static suggestions if no API key
        setAiSuggestions([])
        return
      }

      const suggestions = await generateAISuggestions(aiFetch, content, {
        provider,
        model,
        apiKey: apiKeyConfig?.apiKey || "",
        baseUrl: apiKeyConfig?.baseUrl,
        conversationContext: messages.slice(-3).map(m => m.content)
      })

      setAiSuggestions(suggestions)
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
      setAiSuggestions([])
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }, [settings, messages, isGeneratingSuggestions, aiFetch])

  // State processed above

  // Loading state
  if (isLoading && !selectedSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Consolidated Welcome / Empty State handling
  if (!chatId || messages.length === 0) {
    return (
      <AIWelcomeMode
        session={selectedSession}
        message={message}
        isSending={isSending}
        knowledgeEnabled={knowledgeEnabled}
        attachments={attachments}
        replyingTo={replyingTo}
        onMessageChange={setMessage}
        onSendMessage={() => {
          if (message.trim() || attachments.length > 0) {
            handleSendMessage({ preventDefault: () => { } } as React.FormEvent)
          }
        }}
        onSuggestionClick={handleSuggestionClick}
        onKnowledgeToggle={setKnowledgeEnabled}
        onIconChange={handleIconChange}
        onAgentSelect={handleAgentSelect}
        onAttach={handleAttach}
        onRemoveAttachment={handleRemoveAttachment}
        onCancelReply={handleCancelReply}
        onBack={onBack}
      />
    )
  }

  // Main conversation view
  return (
    <div className="flex h-full min-h-0 bg-background overflow-hidden">

      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-4 flex items-center justify-between bg-muted/10">
          <TabsList className="flex w-full justify-evenly h-9">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="debug" className="text-xs">Debug</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=active]:flex">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <AIChatHeader
              session={selectedSession}
              knowledgeEnabled={knowledgeEnabled}
              onKnowledgeToggle={setKnowledgeEnabled}
              onIconChange={handleIconChange}
              onAgentSelect={handleAgentSelect}
              onBack={onBack}
              onToggleInfo={() => setIsRightPanelOpen(!isRightPanelOpen)}
              isInfoOpen={isRightPanelOpen}
            />

            {/* Messages List */}
            <AIMessageList
              messages={messages}
              isSending={isSending}
              isRegenerating={isRegenerating}
              messageBranches={messageBranches}
              aiSuggestions={aiSuggestions}
              isGeneratingSuggestions={isGeneratingSuggestions}
              onRegenerate={handleRegenerate}
              onReply={handleReply}
              onListen={handleListen}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              onSuggestionClick={handleSuggestionClick}
              generateSuggestionsForMessage={generateSuggestionsForMessage}
            />

            {/* Input */}
            <GrokInput
              value={message}
              onChange={setMessage}
              onSubmit={() => {
                if (message.trim() || attachments.length > 0) {
                  handleSendMessage({ preventDefault: () => { } } as React.FormEvent)
                }
              }}
              placeholder="How can AI help?"
              disabled={isSending}
              thinkHarder={knowledgeEnabled}
              onThinkHarderChange={setKnowledgeEnabled}
              model="Auto"
              onAttach={handleAttach}
              attachments={attachments}
              onRemoveAttachment={handleRemoveAttachment}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
          </div>
        </TabsContent>

        <TabsContent value="debug" className="flex-1 min-h-0 mt-0 data-[state=active]:flex">
          <div className="flex-1 flex min-h-0">
            <AIDebugPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}





export default AIDetailView
