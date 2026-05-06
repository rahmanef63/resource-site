import type { AIMessageData as AIMessage, AIConversation, AISettings } from "../types"

export class AIService {
  private baseUrl: string

  constructor(baseUrl = "/api/ai") {
    this.baseUrl = baseUrl
  }

  async sendMessage(message: string, conversationHistory: AIMessage[] = [], settings: AISettings): Promise<AIMessage> {
    try {
      const messages = [
        ...(settings.systemPrompt
          ? [{ role: "system" as const, content: settings.systemPrompt }]
          : []),
        ...conversationHistory.map((entry) => ({
          role: entry.sender === "ai" ? "assistant" as const : "user" as const,
          content: entry.text,
        })),
        { role: "user" as const, content: message },
      ]

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          provider: settings.provider ?? "openai",
          model: settings.model,
          apiKey: settings.apiKey ?? "",
          baseUrl: settings.baseUrl,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          tools: settings.tools,
          tool_choice: settings.toolChoice,
          thinking: settings.thinking,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const text =
        typeof data.content === "string"
          ? data.content
          : Array.isArray(data.content)
            ? data.content.map((part: any) => (typeof part === "string" ? part : JSON.stringify(part))).join("\n")
            : data.content
              ? JSON.stringify(data.content)
              : ""

      return {
        id: data.id || Date.now().toString(),
        text,
        sender: "ai",
        timestamp: new Date().toISOString(),
        type: "text",
        metadata: {
          model: data.model,
          toolCalls: data.tool_calls,
          usage: data.usage,
        },
      }
    } catch (error) {
      console.error("AI Service error:", error)
      throw error
    }
  }

  async streamMessage(
    message: string,
    conversationHistory: AIMessage[] = [],
    settings: AISettings,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    try {
      const response = await this.sendMessage(message, conversationHistory, settings)
      if (response.text) {
        onChunk(response.text)
      }
    } catch (error) {
      console.error("AI Stream error:", error)
      throw error
    }
  }
}

export class ConversationManager {
  private storageKey = "ai_conversations"

  saveConversations(conversations: AIConversation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(conversations))
    } catch (error) {
      console.error("Failed to save conversations:", error)
    }
  }

  loadConversations(): AIConversation[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load conversations:", error)
      return []
    }
  }

  exportConversations(): string {
    const conversations = this.loadConversations()
    return JSON.stringify(conversations, null, 2)
  }

  importConversations(data: string): AIConversation[] {
    try {
      const conversations = JSON.parse(data)
      this.saveConversations(conversations)
      return conversations
    } catch (error) {
      console.error("Failed to import conversations:", error)
      throw new Error("Invalid conversation data")
    }
  }

  clearAllConversations(): void {
    localStorage.removeItem(this.storageKey)
  }
}

export const aiService = new AIService()
export const conversationManager = new ConversationManager()
