"use client"

/**
 * AI Center Panel - Chat Conversation
 * 
 * Center column panel for the AI feature.
 * Displays the active chat conversation with message list and input.
 * 
 * This panel contains:
 * - Chat header with session info and controls
 * - Message list with streaming support
 * - Grok-style input with attachments and suggestions
 * - Welcome mode when no conversation is active
 */

import { useState, useCallback, useMemo, useEffect } from "react"
import { Sparkles, Settings, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// Grok-style UI components
import { GrokInput } from "@/frontend/shared/communications/components/grok-chat"

// Feature imports
import { useAIStore } from "../stores"
import { useAIActions, useSubAgentRouter } from "../hooks"
import { useAIKnowledgeContext } from "@/frontend/shared/ai/hooks/useAIKnowledgeContext"
import { useAiFetch } from "@/frontend/shared/ai/hooks/useAiFetch"
import { getProviderModels, useAISettingsStorage } from "../settings/useAISettings"
import { AIChatHeader } from "../components/AIChatHeader"
import { AIWelcomeMode } from "../components/AIWelcomeMode"
import { AIMessageList } from "../components/AIMessageList"
import { generateAISuggestions } from "../utils/suggestions"
import { DEFAULT_PROVIDER, DEFAULT_MODEL_ID } from "../constants"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface AICenterPanelProps {
  /** External chat ID override */
  chatId?: string
  /** Callback when back button is pressed */
  onBack?: () => void
  /** Callback to toggle right panel info */
  onToggleInfo?: () => void
  /** Whether the info panel is open */
  isInfoOpen?: boolean
  /** Optional className for styling */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function AICenterPanel({
  chatId: externalChatId,
  onBack,
  onToggleInfo,
  isInfoOpen,
  className,
}: AICenterPanelProps) {
  const [message, setMessage] = useState("")
  const [messageBranches, setMessageBranches] = useState<Record<string, Array<{ id: string; content: string; timestamp: number }>>>({})
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  // AI settings for API calls
  const { settings } = useAISettingsStorage()

  // Shared /api/ai/* fetch chokepoint (injects auth Bearer token)
  const aiFetch = useAiFetch()

  // Check if API key is configured (local OR server env)
  const currentProvider = settings?.defaultProvider || "openrouter"
  const [serverKeys, setServerKeys] = useState<Record<string, boolean>>({})
  useEffect(() => {
    aiFetch("/api/ai/server-keys").then(r => r.ok ? r.json() : {}).then(setServerKeys).catch(() => {})
  }, [aiFetch])
  const hasApiKey = currentProvider === "ollama" ||
    serverKeys[currentProvider] === true ||
    settings?.apiKeys?.some((k: any) => k.providerId === currentProvider && k.isEnabled && k.apiKey)

  const openAISettings = () => {
    window.dispatchEvent(new CustomEvent("open-settings", {
      detail: { tab: "features", featureSlug: "ai" }
    }))
  }

  // Zustand store
  const selectedSession = useAIStore((s) => s.selectedSession)
  const storeSelectedSessionId = useAIStore((s) => s.selectedSessionId)
  const isSending = useAIStore((s) => s.isSending)
  const isLoading = useAIStore((s) => s.isLoading)
  const knowledgeEnabled = useAIStore((s) => s.knowledgeEnabled)
  const setKnowledgeEnabled = useAIStore((s) => s.setKnowledgeEnabled)

  const {
    sendMessage: sendAIMessage,
    createSession,
    selectSession,
    regenerateMessage,
    submitFeedback,
    updateSessionMetadata,
  } = useAIActions()

  // Knowledge context
  const { knowledgeContext } = useAIKnowledgeContext()

  // Access sub-agent router state to show feedback
  const { isProcessing: isAgentProcessing, lastToolUsed } = useSubAgentRouter()

  // Show feedback when tool is executing
  useEffect(() => {
    if (isAgentProcessing && lastToolUsed) {
      toast.loading(`Running tool: ${lastToolUsed}...`, { id: "agent-tool-execution" })
    } else if (!isAgentProcessing && lastToolUsed) {
      toast.dismiss("agent-tool-execution")
      toast.success(`Completed: ${lastToolUsed}`, { duration: 2000 })
    }
  }, [isAgentProcessing, lastToolUsed])

  // Use external or store chatId
  const chatId = externalChatId ?? storeSelectedSessionId
  const messages = selectedSession?.messages ?? []

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAttach = useCallback((files: FileList) => {
    setAttachments((prev) => [...prev, ...Array.from(files)])
    toast.success(`${files.length} file(s) attached`)
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleReply = useCallback((content: string) => {
    setReplyingTo(content)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleListen = useCallback((content: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(content)
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Text-to-speech not supported in this browser")
    }
  }, [])

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!message.trim() && attachments.length === 0) return

      const contextToUse = knowledgeEnabled ? knowledgeContext : undefined

      // Handle attachments
      let finalMessage = message

      // Handle reply context
      if (replyingTo) {
        const quote = `> ${replyingTo.substring(0, 200)}${replyingTo.length > 200 ? "..." : ""}\n\n`
        finalMessage = `${quote}${finalMessage}`
      }

      if (attachments.length > 0) {
        const fileNames = attachments.map((f) => f.name).join(", ")
        finalMessage = `${finalMessage}\n\n[Attached: ${fileNames}]`
      }

      // If no session, create one first
      if (!chatId) {
        const session = await createSession("New Chat")
        if (session) {
          selectSession(session._id)
          await sendAIMessage(finalMessage, contextToUse, session._id, {
            attachments: attachments.map((f) => ({
              id: Math.random().toString(36).substring(2, 15),
              name: f.name,
              type: f.type,
              url: "",
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
        attachments: attachments.map((f) => ({
          id: Math.random().toString(36).substring(2, 15),
          name: f.name,
          type: f.type,
          url: "",
          size: f.size,
        })),
        replyTo: replyingTo || undefined,
      })
      setMessage("")
      setAttachments([])
      setReplyingTo(null)
    },
    [message, attachments, replyingTo, chatId, knowledgeEnabled, knowledgeContext, createSession, selectSession, sendAIMessage]
  )

  const handleCopy = useCallback(async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard")
  }, [])

  const handleThumbsUp = useCallback(
    (messageId?: string) => {
      if (chatId && messageId) {
        submitFeedback(chatId as any, messageId, "up")
        toast.success("Thanks for the feedback!")
      }
    },
    [chatId, submitFeedback]
  )

  const handleThumbsDown = useCallback(
    (messageId?: string) => {
      if (chatId && messageId) {
        submitFeedback(chatId as any, messageId, "down")
        toast.info("Thanks for the feedback. We'll improve!")
      }
    },
    [chatId, submitFeedback]
  )

  // Regenerate creates a new branch
  const handleRegenerate = useCallback(
    async (originalMessageId: string, originalContent: string) => {
      if (!selectedSession?.messages.length) return

      setIsRegenerating(true)
      try {
        const userMessages = selectedSession.messages.filter((m) => m.role === "user")
        const lastUserMessage = userMessages[userMessages.length - 1]

        if (!lastUserMessage) return

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

        const systemMessages: { role: "system"; content: string }[] = []
        if (knowledgeEnabled && knowledgeContext) {
          systemMessages.push({
            role: "system",
            content: `You have access to the following knowledge:\n\n${knowledgeContext}`,
          })
        }

        const msgIndex = selectedSession.messages.findIndex((m) => m.id === originalMessageId)
        const messagesBeforeThis = selectedSession.messages.slice(0, msgIndex).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const apiMessages = [...systemMessages, ...messagesBeforeThis]

        const response = await aiFetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            provider,
            model,
            apiKey: apiKeyConfig?.apiKey || "",
            baseUrl: apiKeyConfig?.baseUrl,
            temperature: (settings?.temperature || 0.7) + 0.1,
            maxTokens: parseInt(settings?.maxTokens || "2048"),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `API error: ${response.status}`)
        }

        const data = await response.json()
        const responseContent = data.content || "Failed to regenerate"

        setMessageBranches((prev) => {
          const existing = prev[originalMessageId] || [{ id: originalMessageId, content: originalContent, timestamp: Date.now() }]
          return {
            ...prev,
            [originalMessageId]: [...existing, { id: `branch-${Date.now()}`, content: responseContent, timestamp: Date.now() }],
          }
        })

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
    },
    [selectedSession, knowledgeEnabled, knowledgeContext, settings, chatId, regenerateMessage, aiFetch]
  )

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setMessage(suggestion)
  }, [])

  const handleIconChange = useCallback(
    async (icon: string) => {
      if (chatId && updateSessionMetadata) {
        await updateSessionMetadata(chatId as any, { icon })
        toast.success("Icon updated")
      }
    },
    [chatId, updateSessionMetadata]
  )

  const handleAgentSelect = useCallback(
    async (agentId: string | null) => {
      if (!chatId || !updateSessionMetadata) return

      await updateSessionMetadata(chatId as any, {
        metadata: { agentId: agentId || undefined },
      })

      if (agentId) {
        toast.success("Agent selected")
      } else {
        toast.success("Switched to General Assistant")
      }
    },
    [chatId, updateSessionMetadata]
  )

  // Generate AI suggestions when last message changes
  const generateSuggestionsForMessage = useCallback(
    async (content: string) => {
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
          settings.apiKeys?.find((k: { providerId: string; isEnabled: boolean }) => k.providerId === provider && k.isEnabled) ||
          settings.apiKeys?.find((k: { providerId: string; isEnabled: boolean }) => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled)

        if (!apiKeyConfig?.apiKey && provider !== "ollama") {
          setAiSuggestions([])
          return
        }

        const suggestions = await generateAISuggestions(aiFetch, content, {
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey || "",
          baseUrl: apiKeyConfig?.baseUrl,
          conversationContext: messages.slice(-3).map((m) => m.content),
        })

        setAiSuggestions(suggestions)
      } catch (error) {
        console.error("Failed to generate suggestions:", error)
        setAiSuggestions([])
      } finally {
        setIsGeneratingSuggestions(false)
      }
    },
    [settings, messages, isGeneratingSuggestions, aiFetch]
  )

  // ============================================================================
  // Render
  // ============================================================================

  // Loading state
  if (isLoading && !selectedSession) {
    return (
      <div className={cn("flex-1 flex items-center justify-center bg-background", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Welcome / Empty State
  if (!chatId || messages.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {!hasApiKey && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Add your <strong>{currentProvider}</strong> API key to start chatting.</span>
            <Button size="sm" variant="outline" className="ml-auto h-6 text-xs px-2 border-amber-300 dark:border-amber-700" onClick={openAISettings}>
              <Settings className="h-3 w-3 mr-1" />
              Configure in Settings
            </Button>
          </div>
        )}
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
              handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
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
      </div>
    )
  }

  // Main conversation view
  return (
    <div className={cn("flex flex-col h-full min-h-0 bg-background overflow-hidden", className)}>
      {/* Header */}
      <AIChatHeader
        session={selectedSession}
        knowledgeEnabled={knowledgeEnabled}
        onKnowledgeToggle={setKnowledgeEnabled}
        onIconChange={handleIconChange}
        onAgentSelect={handleAgentSelect}
        onBack={onBack}
        onToggleInfo={onToggleInfo}
        isInfoOpen={isInfoOpen}
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

      {/* No API Key Banner */}
      {!hasApiKey && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>No API key for <strong>{currentProvider}</strong>. Messages may fail.</span>
          <Button size="sm" variant="outline" className="ml-auto h-6 text-xs px-2 border-amber-300 dark:border-amber-700" onClick={openAISettings}>
            <Settings className="h-3 w-3 mr-1" />
            Configure
          </Button>
        </div>
      )}

      {/* Input */}
      <GrokInput
        value={message}
        onChange={setMessage}
        onSubmit={() => {
          if (message.trim() || attachments.length > 0) {
            handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
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
  )
}

export default AICenterPanel
