"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useQuery, useMutation, useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { AIConversation, AIMessageData, AISettings } from "../types"
import { generateId, generateConversationTitle, extractTopicFromMessage } from "../utils"
import { parseAIError, PROVIDER_NAMES } from "../utils/error-handler"
import { DEFAULT_AI_SETTINGS, DEFAULT_MODEL_ID, DEFAULT_PROVIDER } from "../constants"
import { useAIStore, type AISession, type AIMessage } from "../stores"
import { getProviderModels, useAISettingsStorage, type AIApiKeyConfig } from "../settings/useAISettings"
import { toast } from "sonner"

// Re-export sub-agent router hook
export { useSubAgentRouter } from "./useSubAgentRouter"

// ============================================================================
// Initialize AI Hook (like useInitializeChat)
// ============================================================================

export const useInitializeAI = (providedWorkspaceId?: Id<"workspaces"> | null) => {
  const { workspaceId: contextWorkspaceId } = useWorkspaceContext();
  const currentUser = useCurrentUser();
  const init = useAIStore((s) => s.init);
  const setSessions = useAIStore((s) => s.setSessions);
  const setLoading = useAIStore((s) => s.setLoading);
  const globalMode = useAIStore((s) => s.globalMode);

  const effectiveWorkspaceId = (providedWorkspaceId ?? (contextWorkspaceId as Id<"workspaces"> | null)) || null;
  // IMPORTANT: Use Convex users document id, not auth user id.
  // Backend uses ensureUser() which returns Id<"users">.
  const userId = currentUser?._id ?? null;

  const initializedRef = useRef<string | null>(null);

  // Query sessions from Convex - respects global mode
  const sessions = useQuery(
    api.features.ai.queries.listChatSessions,
    userId
      ? {
        workspaceId: globalMode ? undefined : effectiveWorkspaceId ?? undefined,
        userId: String(userId),
        status: "active",
        global: globalMode,
      }
      : "skip"
  );

  useEffect(() => {
    if (!userId) return;
    // In workspace mode we need a workspaceId; in global mode we don't.
    if (!globalMode && !effectiveWorkspaceId) return;

    const key = `${globalMode ? "global" : effectiveWorkspaceId}-${userId}`;
    if (initializedRef.current === key) return;

    init(effectiveWorkspaceId, String(userId));
    initializedRef.current = key;
  }, [effectiveWorkspaceId, userId, globalMode, init]);

  // Sync sessions from Convex to store
  useEffect(() => {
    if (sessions === undefined) {
      setLoading(true);
      return;
    }

    // Transform Convex sessions to store format
    const transformedSessions: AISession[] = sessions.map((s: any) => ({
      _id: s._id,
      id: s._id, // Alias for ConversationItem compatibility
      workspaceId: s.workspaceId,
      userId: s.userId,
      title: s.title,
      isGlobal: s.isGlobal,
      messages: s.messages.map((m: any, idx: number) => ({
        id: `${s._id}-${idx}`,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        timestamp: m.timestamp,
        metadata: m.metadata,
      })),
      status: s.status as 'active' | 'archived',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    setSessions(transformedSessions);
    setLoading(false);
  }, [sessions, setSessions, setLoading]);

  return { workspaceId: effectiveWorkspaceId, userId, globalMode };
};

// ============================================================================
// AI Actions Hook (create session, send message)
// ============================================================================

export const useAIActions = () => {
  const convex = useConvex();
  const workspaceId = useAIStore((s) => s.workspaceId);
  const userId = useAIStore((s) => s.userId);
  const globalMode = useAIStore((s) => s.globalMode);
  const sessions = useAIStore((s) => s.sessions);
  const selectedSessionId = useAIStore((s) => s.selectedSessionId);
  const selectedSession = useAIStore((s) => s.selectedSession);
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources);
  const addSession = useAIStore((s) => s.addSession);
  const addMessage = useAIStore((s) => s.addMessage);
  const updateSession = useAIStore((s) => s.updateSession);
  const setSelectedSession = useAIStore((s) => s.setSelectedSession);
  const setSending = useAIStore((s) => s.setSending);
  const setError = useAIStore((s) => s.setError);

  // Get AI settings for API key and model
  const { settings } = useAISettingsStorage();

  const createSessionMutation = useMutation(api.features.ai.mutations.createChatSession);
  const appendMessageMutation = useMutation(api.features.ai.mutations.appendChatMessage);
  const updateSessionMutation = useMutation(api.features.ai.mutations.updateChatSession);
  const deleteSessionMutation = useMutation(api.features.ai.mutations.deleteChatSession);
  const addMessageBranchMutation = useMutation(api.features.ai.mutations.addMessageBranch);
  const setMessageFeedbackMutation = useMutation(api.features.ai.mutations.setMessageFeedback);

  // Generate title using AI based on conversation
  const generateTitle = useCallback(async (
    userMessage: string,
    aiResponse: string,
    provider: string,
    model: string,
    apiKey: string,
    baseUrl?: string
  ) => {
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Generate a very short title (3-6 words max) that summarizes this conversation topic. Return ONLY the title, no quotes, no punctuation at the end, no explanation."
            },
            { role: "user", content: userMessage },
            { role: "assistant", content: aiResponse.slice(0, 500) }, // Limit for context
            { role: "user", content: "Generate a short title for this conversation:" }
          ],
          provider,
          model,
          apiKey,
          baseUrl,
          temperature: 0.3,
          maxTokens: 20,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Clean up the title - remove quotes and extra whitespace
        const title = data.content?.trim().replace(/^["']|["']$/g, '').slice(0, 50);
        return title || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to generate title:", error);
      return null;
    }
  }, []);

  const createSession = useCallback(async (title?: string) => {
    if (!userId) {
      console.error("Cannot create session: userId missing");
      return null;
    }

    // For workspace mode, workspaceId is required
    if (!globalMode && !workspaceId) {
      console.error("Cannot create workspace session: workspaceId missing");
      return null;
    }

    try {
      const session = await createSessionMutation({
        workspaceId: globalMode ? undefined : workspaceId ?? undefined,
        userId: userId as unknown as Id<"users">,
        title: title || "New Chat",
        isGlobal: globalMode,
      });

      if (session) {
        const newSession: AISession = {
          _id: session._id,
          id: session._id, // Alias for ConversationItem compatibility
          workspaceId: session.workspaceId,
          userId: session.userId,
          title: session.title,
          isGlobal: session.isGlobal,
          messages: [],
          status: session.status as 'active' | 'archived',
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        };
        addSession(newSession);
        return session;
      }
      return null;
    } catch (error) {
      console.error("Failed to create session:", error);
      return null;
    }
  }, [workspaceId, userId, globalMode, createSessionMutation, addSession]);

  const sendMessage = useCallback(async (
    content: string,
    knowledgeContext?: string,
    sessionIdOverride?: Id<"aiChatSessions">,
    options?: {
      attachments?: any[],
      replyTo?: string,
    }
  ) => {
    // Allow passing sessionId directly for immediate use after session creation
    const targetSessionId: Id<"aiChatSessions"> | null = sessionIdOverride ?? selectedSessionId;

    if (!targetSessionId) {
      console.error("No session selected");
      return null;
    }

    // TypeScript now knows targetSessionId is Id<"aiChatSessions">
    const sessionId = targetSessionId;

    // Get the target session from store
    const targetSession = sessionIdOverride
      ? sessions.find((s: AISession) => s._id === sessionIdOverride)
      : selectedSession;

    // Get the API key for the configured provider
    // settings can be temporarily undefined while loading.
    const providerRaw = settings?.defaultProvider || DEFAULT_PROVIDER;
    const provider = providerRaw === "z-ai" ? "glm" : providerRaw;

    const configuredModel = settings?.defaultModel || DEFAULT_MODEL_ID;
    const availableModels = getProviderModels(provider);
    const model =
      availableModels.length > 0 && !availableModels.some((m) => m.id === configuredModel)
        ? availableModels[0].id
        : configuredModel;

    const apiKeyConfig =
      settings?.apiKeys?.find((k: AIApiKeyConfig) => k.providerId === provider && k.isEnabled) ||
      settings?.apiKeys?.find(
        (k: AIApiKeyConfig) => k.providerId === (provider === "glm" ? "z-ai" : provider) && k.isEnabled
      );

    // Providers whose API key can be supplied by server env (OPENROUTER_API_KEY etc.)
    // Allow the request through with empty key — server will use env fallback.
    const hasEnvFallback = provider === "openrouter" || provider === "groq" || provider === "openai" || provider === "anthropic";
    if (!apiKeyConfig?.apiKey && provider !== "ollama" && !hasEnvFallback) {
      const providerName = PROVIDER_NAMES[provider] || provider;
      toast.error('API Key Required', {
        description: `No API key configured for ${providerName}. Please add your API key in AI Settings.`,
        duration: 8000,
      });
      return null;
    }

    setSending(true);
    setError(null);

    // Check if this is the first message (for auto-title generation)
    const isFirstMessage = !targetSession?.messages?.length || targetSession.messages.length === 0;

    try {
      // Add user message to store immediately for optimistic UI
      const userMessageId = `${sessionId}-${Date.now()}`;
      addMessage(sessionId, {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments: options?.attachments,
        replyTo: options?.replyTo,
      });

      // Persist user message to Convex
      await appendMessageMutation({
        sessionId,
        message: content,
        role: "user",
        id: userMessageId,
        attachments: options?.attachments,
        replyTo: options?.replyTo,
      });

      // Build system prompt with knowledge context
      const systemMessages: { role: 'system'; content: string }[] = [];

      if (knowledgeContext && !globalMode) {
        systemMessages.push({
          role: 'system',
          content: `You have access to the following knowledge from this workspace. Use this information to provide accurate, context-aware responses:\n\n${knowledgeContext}\n\nWhen answering questions, reference this knowledge when relevant. If the user asks about something not covered in the knowledge base, acknowledge that and provide general assistance.`,
        });
      }

      // Build messages array for API (include conversation history)
      const messages = [
        ...systemMessages,
        ...(targetSession?.messages || []).map((m: AIMessage) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user" as const, content },
      ];

      // Get tool definitions from registry
      const { subAgentRegistry } = await import("../agent/registry");
      const tools = subAgentRegistry.getToolDefinitions();

      // Call AI API
      const startTime = Date.now();
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          provider,
          model,
          apiKey: apiKeyConfig?.apiKey || "",
          baseUrl: apiKeyConfig?.baseUrl,
          temperature: settings?.temperature ?? 0.7,
          maxTokens: parseInt(settings?.maxTokens || "2048"),
          tools: tools, // Pass tools to API
          tool_choice: "auto",
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      let aiResponse = data.content || ""; // Might be null if it's a pure tool call
      let toolCalls = data.tool_calls;
      let toolExecuted = false;

      // Handle Native Tool Calls (Response from Provider)
      if (toolCalls && toolCalls.length > 0) {
        const { executeToolCall } = await import("../agent/router");

        // Execute all tool calls
        for (const toolCall of toolCalls) {
          try {
            // Execute tool on frontend (which calls backend)
            const context = {
              workspaceId: workspaceId as any,
              userId: userId,
              convex: convex, // Pass the real convex client
            };

            // We need to use executeToolCall from router
            const result = await executeToolCall(toolCall, context);

            // Append tool result to the conversation for the AI to see (if we were doing a loop)
            // For now, we'll just format the result for the user message
            if (result.result.success) {
              aiResponse += `\n\n✅ Executed **${result.toolName}**: Success`;
              toolExecuted = true;
            } else {
              aiResponse += `\n\n❌ Failed to execute **${result.toolName}**: ${result.result.error}`;
            }
          } catch (err) {
            console.error("Tool execution error:", err);
            aiResponse += `\n\n❌ Error executing tool: ${err instanceof Error ? err.message : "Unknown error"}`;
          }
        }
      }
      // Fallback: Check for Regex JSON if no native tool calls (for providers that don't support it well or legacy behavior)
      else {
        const toolCallMatch = aiResponse?.match(/```json\s*([\s\S]*?)```/);
        if (toolCallMatch) {
          // ... existing regex logic ...
          try {
            const toolCallJson = JSON.parse(toolCallMatch[1].trim());
            if (toolCallJson.tool && toolCallJson.params) {
              // Execute the tool
              const { executeTool } = await import("../agent/router");
              const context = {
                workspaceId: workspaceId as any,
                userId: userId,
                convex: convex, // Pass the real convex client
              };

              // Execute via router
              const result = await executeTool(
                "documents", // Assuming documents for legacy regex
                toolCallJson.tool === "createDocument" ? "create" : toolCallJson.tool,
                toolCallJson.params,
                context
              );

              if (result.success) {
                aiResponse = `✅ Created document **"${toolCallJson.params.title}"** successfully!\n\nThe document has been saved with all the rich content formatting.`;
                toolExecuted = true;
              } else {
                aiResponse = `❌ Failed to execute action: ${result.error}`;
              }
            }
          } catch (e) { /* ignore parse error */ }
        }
      }

      // Add AI response to store
      addMessage(sessionId, {
        id: `${sessionId}-${Date.now()}-ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
        metadata: {
          model: data.model,
          tokenCount: data.usage?.total_tokens,
          duration,
        },
      });

      // Persist AI response to Convex
      await appendMessageMutation({
        sessionId,
        message: aiResponse,
        role: "assistant",
        metadata: {
          tokenCount: data.usage?.total_tokens,
          duration,
        },
      });

      // Auto-generate title after first message exchange for new chats
      if (isFirstMessage && targetSession?.title === "New Chat") {
        const generatedTitle = await generateTitle(
          content,
          aiResponse,
          provider,
          model,
          apiKeyConfig?.apiKey || "",
          apiKeyConfig?.baseUrl
        );

        if (generatedTitle) {
          // Update in Convex
          await updateSessionMutation({
            sessionId,
            title: generatedTitle,
          });

          // Update in local store
          updateSession(sessionId, { title: generatedTitle });
        }
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
      console.error("AI chat error:", error);
      setError(errorMessage);

      // Parse error for user-Contactly message
      const parsedError = parseAIError(error instanceof Error ? error : errorMessage, provider);

      toast.error(parsedError.title, {
        description: parsedError.message,
        duration: parsedError.retryDelay ? (parsedError.retryDelay + 5) * 1000 : 8000,
        action: parsedError.actionUrl ? {
          label: parsedError.action || 'Learn more',
          onClick: () => window.open(parsedError.actionUrl, '_blank'),
        } : undefined,
      });

      return null;
    } finally {
      setSending(false);
    }
  }, [selectedSessionId, selectedSession, sessions, settings, appendMessageMutation, addMessage, setSending, setError, generateTitle, updateSessionMutation, updateSession, globalMode]);

  const deleteSession = useCallback(async (sessionId: Id<"aiChatSessions">) => {
    try {
      await deleteSessionMutation({ sessionId });
      // Local cleanup
      useAIStore.getState().removeSession(sessionId);
      toast.success("Session deleted");
      return true;
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
      return false;
    }
  }, [deleteSessionMutation]);

  const regenerateMessage = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    messageId: string,
    newContent: string
  ) => {
    try {
      await addMessageBranchMutation({
        sessionId,
        messageId,
        content: newContent,
      });
      return true;
    } catch (error) {
      console.error("Failed to add message branch:", error);
      return false;
    }
  }, [addMessageBranchMutation]);

  const submitFeedback = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    messageId: string,
    feedback: "up" | "down"
  ) => {
    try {
      await setMessageFeedbackMutation({
        sessionId,
        messageId,
        feedback,
      });
      return true;
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      return false;
    }
  }, [setMessageFeedbackMutation]);

  const updateSessionMetadata = useCallback(async (
    sessionId: Id<"aiChatSessions">,
    updates: { icon?: string; title?: string; topic?: string; metadata?: Record<string, any> }
  ) => {
    try {
      await updateSessionMutation({
        sessionId,
        ...updates,
      });
      updateSession(sessionId, updates);
      return true;
    } catch (error) {
      console.error("Failed to update session metadata:", error);
      return false;
    }
  }, [updateSessionMutation, updateSession]);

  return {
    createSession,
    sendMessage,
    regenerateMessage,
    submitFeedback,
    updateSessionMetadata,
    selectSession: setSelectedSession,
    deleteSession,
  };
};

// ============================================================================
// Legacy hooks (kept for backward compatibility)
// ============================================================================

export const useAIConversations = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const createNewConversation = useCallback((firstMessage?: string): string => {
    const id = generateId()
    const title = firstMessage ? generateConversationTitle(firstMessage) : "New Conversation"
    const topic = firstMessage ? extractTopicFromMessage(firstMessage) : "General"

    const newConversation: AIConversation = {
      id,
      title,
      topic,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: DEFAULT_AI_SETTINGS,
    }

    setConversations((prev) => [newConversation, ...prev])
    setSelectedChatId(id)

    return id
  }, [])

  const addMessage = useCallback((conversationId: string, message: AIMessageData) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
            ...conv,
            messages: [...conv.messages, message],
            updatedAt: new Date().toISOString(),
          }
          : conv,
      ),
    )
  }, [])

  const updateConversation = useCallback((conversationId: string, updates: Partial<AIConversation>) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates, updatedAt: new Date().toISOString() } : conv,
      ),
    )
  }, [])

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      if (selectedChatId === conversationId) {
        setSelectedChatId(undefined)
      }
    },
    [selectedChatId],
  )

  const selectedConversation = conversations.find((conv) => conv.id === selectedChatId)

  return {
    conversations,
    selectedChatId,
    selectedConversation,
    isLoading,
    setSelectedChatId,
    setIsLoading,
    createNewConversation,
    addMessage,
    updateConversation,
    deleteConversation,
  }
}

export const useAIChat = (conversationId?: string) => {
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (message: string, onAddMessage: (message: AIMessageData) => void, settings?: AISettings) => {
      if (!conversationId) return

      setIsTyping(true)
      setError(null)

      // Add user message
      const userMessage: AIMessageData = {
        id: generateId(),
        text: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        type: "text",
      }

      onAddMessage(userMessage)

      try {
        // Simulate AI response (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        const aiMessage: AIMessageData = {
          id: generateId(),
          text: `This is a simulated AI response to: "${message}". In a real implementation, this would be replaced with actual AI API calls.`,
          sender: "ai",
          timestamp: new Date().toISOString(),
          type: "text",
        }

        onAddMessage(aiMessage)
      } catch (err) {
        setError("Failed to get AI response. Please try again.")
        console.error("AI chat error:", err)
      } finally {
        setIsTyping(false)
      }
    },
    [conversationId],
  )

  return {
    sendMessage,
    isTyping,
    error,
    clearError: () => setError(null),
  }
}

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS)

  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AI_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
