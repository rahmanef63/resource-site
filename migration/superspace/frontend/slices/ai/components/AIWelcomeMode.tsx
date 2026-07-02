"use client"

import { Sparkles } from "lucide-react"
import { GrokInput } from "@/frontend/shared/communications/components/grok-chat"
import { DEFAULT_SUGGESTIONS } from "../constants"
import { AIChatHeader } from "./AIChatHeader"
import type { AISession } from "../stores"

interface AIWelcomeModeProps {
    session: AISession | null
    message: string
    isSending: boolean
    knowledgeEnabled: boolean
    attachments: File[]
    replyingTo: string | null

    onMessageChange: (val: string) => void
    onSendMessage: (e?: React.FormEvent) => void
    onSuggestionClick: (suggestion: string) => void
    onKnowledgeToggle: (enabled: boolean) => void
    onIconChange: (icon: string) => void
    onAgentSelect: (agentId: string | null) => void
    onAttach: (files: FileList) => void
    onRemoveAttachment: (index: number) => void
    onCancelReply: () => void
    onBack?: () => void
}

export function AIWelcomeMode({
    session,
    message,
    isSending,
    knowledgeEnabled,
    attachments,
    replyingTo,
    onMessageChange,
    onSendMessage,
    onSuggestionClick,
    onKnowledgeToggle,
    onIconChange,
    onAgentSelect,
    onAttach,
    onRemoveAttachment,
    onCancelReply,
    onBack,
}: AIWelcomeModeProps) {

    // We reuse this component for both:
    // 1. "No Session Selected" state (session = null)
    // 2. "New Session Empty" state (session exists but messages = 0)

    // However, the original AIDetailView logic differentiated them slightly in layout.
    // The "No Session" layout was centered full page.
    // The "New Session" layout had the Header.

    // Let's check which mode we are in based on props.
    const hasSession = !!session

    if (!hasSession) {
        // 1. No Session Selected (Landing Mode)
        return (
            <div className="flex flex-col h-full min-h-0 bg-background">
                <div className="flex-1 flex items-center justify-center overflow-y-auto">
                    <div className="text-center max-w-lg p-4">
                        <div className="text-foreground text-2xl font-medium mb-2">
                            How can AI help?
                        </div>
                        <p className="text-muted-foreground text-sm mb-8">
                            Ask anything. Get answers, ideas, and assistance.
                        </p>

                        {/* Suggestions */}
                        <div className="space-y-3">
                            {DEFAULT_SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSuggestionClick(s)}
                                    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground text-sm"
                                >
                                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Input */}
                <GrokInput
                    value={message}
                    onChange={onMessageChange}
                    onSubmit={() => {
                        if (message.trim() || attachments.length > 0) {
                            onSendMessage()
                        }
                    }}
                    placeholder="How can AI help?"
                    disabled={isSending}
                    thinkHarder={knowledgeEnabled}
                    onThinkHarderChange={onKnowledgeToggle}
                    model="Auto"
                    onAttach={onAttach}
                    attachments={attachments}
                    onRemoveAttachment={onRemoveAttachment}
                    replyingTo={replyingTo}
                    onCancelReply={onCancelReply}
                />
            </div>
        )
    }

    // 2. New Session Empty Mode (Has Header)
    return (
        <div className="flex flex-col h-full min-h-0 bg-background">
            {/* Header */}
            <AIChatHeader
                session={session}
                knowledgeEnabled={knowledgeEnabled}
                onKnowledgeToggle={onKnowledgeToggle}
                onIconChange={onIconChange}
                onAgentSelect={onAgentSelect}
                onBack={onBack}
            />

            <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
                <div className="text-center max-w-lg">
                    <Sparkles className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium text-foreground mb-2">Start a conversation</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Ask a question or start with a suggestion below.
                    </p>

                    {/* Suggestions */}
                    <div className="space-y-3">
                        {DEFAULT_SUGGESTIONS.slice(0, 3).map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s)}
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-secondary-foreground text-sm"
                            >
                                <Sparkles className="h-4 w-4 text-muted-foreground" />
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Input */}
            <GrokInput
                value={message}
                onChange={onMessageChange}
                onSubmit={() => {
                    if (message.trim() || attachments.length > 0) {
                        onSendMessage()
                    }
                }}
                placeholder="How can AI help?"
                disabled={isSending}
                thinkHarder={knowledgeEnabled}
                onThinkHarderChange={onKnowledgeToggle}
                model="Auto"
                onAttach={onAttach}
                attachments={attachments}
                onRemoveAttachment={onRemoveAttachment}
                replyingTo={replyingTo}
                onCancelReply={onCancelReply}
            />
        </div>
    )
}
