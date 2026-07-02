"use client"

import { toast } from "sonner"
import { Response } from "@/frontend/shared/communications/components/ai"
import {
    GrokUserMessage,
    GrokAIMessage,
    GrokTypingIndicator,
    GrokChatContainer,
} from "@/frontend/shared/communications/components/grok-chat"
import type { AIMessage } from "../stores"

interface AIMessageListProps {
    messages: AIMessage[]
    isSending: boolean // To show typing indicator and streaming state for last message
    isRegenerating: boolean
    messageBranches: Record<string, Array<{ id: string; content: string; timestamp: number }>> // Local branches state
    aiSuggestions: string[]
    isGeneratingSuggestions: boolean

    // Handlers
    onRegenerate: (msgId: string, content: string) => void
    onReply: (content: string) => void
    onListen: (content: string) => void
    onThumbsUp: (msgId: string) => void
    onThumbsDown: (msgId: string) => void
    onSuggestionClick: (suggestion: string) => void
    generateSuggestionsForMessage: (content: string) => void
}

export function AIMessageList({
    messages,
    isSending,
    isRegenerating,
    messageBranches,
    aiSuggestions,
    isGeneratingSuggestions,
    onRegenerate,
    onReply,
    onListen,
    onThumbsUp,
    onThumbsDown,
    onSuggestionClick,
    generateSuggestionsForMessage,
}: AIMessageListProps) {

    return (
        <GrokChatContainer>
            {messages.map((msg, index) => {
                const isUser = msg.role === 'user'
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

                // Use AI-generated suggestions for the last AI message, or fallback to simple context-aware ones
                const followUpSuggestions = isLastAIMessage
                    ? (aiSuggestions.length > 0 ? aiSuggestions : undefined)
                    : undefined

                // Trigger AI suggestion generation for last message if not already generated
                if (isLastAIMessage && aiSuggestions.length === 0 && !isGeneratingSuggestions && !isSending) {
                    // Use setTimeout to avoid calling during render - Side effect in render is generally bad practice but keeping logic consistent with original for now
                    setTimeout(() => generateSuggestionsForMessage(msg.content), 100)
                }

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
                        reasoning={msg.reasoning}
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
