/**
 * Agent Block
 * 
 * AI Assistant panel with suggestions, input, and tool count.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ListSkeleton } from "../shared"

// ============================================================================
// Types
// ============================================================================

export interface AgentBlockProps {
    agentName?: string
    description?: string
    featureSlug?: string
    suggestions?: string[]
    toolCount?: number
    loading?: boolean
    response?: string
    onSendMessage?: (message: string) => void
    onSuggestionClick?: (suggestion: string) => void
    className?: string
}

// ============================================================================
// Agent Block
// ============================================================================

export function AgentBlock({
    agentName = "Assistant",
    description = "Ask me anything about your workspace",
    featureSlug,
    suggestions = ["What can you help me with?", "Show me what's new", "Help me get started"],
    toolCount = 0,
    loading = false,
    response,
    onSendMessage,
    onSuggestionClick,
    className,
}: AgentBlockProps) {
    const [inputValue, setInputValue] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
            onSendMessage?.(inputValue)
            setInputValue("")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        if (onSuggestionClick) {
            onSuggestionClick(suggestion)
        } else if (onSendMessage) {
            onSendMessage(suggestion)
        }
    }

    return (
        <Card className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-medium">{agentName}</CardTitle>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="flex-1 flex flex-col p-0">
                {loading ? (
                    <div className="p-4">
                        <ListSkeleton rows={3} />
                    </div>
                ) : (
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {/* Agent Icon & Description */}
                            <div className="flex flex-col items-center text-center pt-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg">{agentName}</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                                    {description}
                                </p>
                            </div>

                            {/* Response */}
                            {response && (
                                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                    {response}
                                </div>
                            )}

                            {/* Suggestions */}
                            <div className="space-y-2">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors text-sm group"
                                    >
                                        <span className="text-foreground">{suggestion}</span>
                                        <ArrowRight className="h-4 w-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                    </button>
                                ))}
                            </div>

                            {/* Tool Count */}
                            {toolCount > 0 && (
                                <div className="flex justify-center">
                                    <Badge variant="secondary" className="text-xs">
                                        {toolCount} tools available
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}

                {/* Input Form */}
                <div className="p-4 border-t mt-auto">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`Ask ${agentName}...`}
                                className="pl-9 pr-4 bg-muted/50 border-muted"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            variant="ghost"
                            disabled={!inputValue.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                        <Badge variant="outline" className="text-xs shrink-0">
                            Auto
                        </Badge>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}

export default AgentBlock
