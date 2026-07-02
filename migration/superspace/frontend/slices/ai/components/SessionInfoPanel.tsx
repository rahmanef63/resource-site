"use client"

import { useMemo } from "react"
import {
    Activity,
    Settings2,
    FileText,
    Brain,
    Clock,
    Cpu,
    Coins,
    Layers
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AISession } from "../stores"

interface SessionInfoPanelProps {
    session: AISession | null
    className?: string
}

export function SessionInfoPanel({ session, className }: SessionInfoPanelProps) {
    // Compute stats from messages
    const stats = useMemo(() => {
        if (!session) return { tokens: 0, cost: 0, duration: 0, toolCalls: 0 }

        return session.messages.reduce((acc, msg) => {
            const meta = msg.metadata || {}
            return {
                tokens: acc.tokens + (meta.tokenCount || 0),
                // Mock cost calculation (e.g. $0.01 per 1k input/output avg)
                cost: acc.cost + ((meta.tokenCount || 0) / 1000) * 0.01,
                duration: acc.duration + (meta.duration || 0),
                toolCalls: acc.toolCalls + (msg.role === 'assistant' && !msg.content ? 1 : 0) // Basic heuristic
            }
        }, { tokens: 0, cost: 0, duration: 0, toolCalls: 0 })
    }, [session])

    // Extract generated content (documents)
    // This is a heuristic - looking for tool results or structured content
    const generatedContent = useMemo(() => {
        if (!session) return []
        // In a real implementation, we'd parse tool results more strictly.
        // For now, we look for messages that mention "Created document" or similar in tool results
        // Or just look for specific patterns. 
        // Since we don't store strict tool calls in the basic message type yet (they are in metadata or content),
        // we'll mock this slightly or use available metadata if we added it.

        // For this demo, let's just list the messages that are "assistant" and have "Created" in them as a placeholder
        // In the future, we should store `artifacts` array in the session or message.
        return session.messages
            .filter(m => m.role === 'assistant' && (m.content.includes("Created document") || m.content.includes("Generated")))
            .map(m => ({
                id: m.id,
                summary: m.content.slice(0, 50) + "...",
                timestamp: m.timestamp
            }))
    }, [session])

    if (!session) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center", className)}>
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Select a conversation to view details</p>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col h-full bg-background border-l", className)}>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Session Info
                </h3>
                <Badge variant={session.status === 'active' ? "default" : "secondary"} className="uppercase text-[10px]">
                    {session.status}
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2 shrink-0">
                    <TabsList className="flex w-full justify-evenly">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="debug">Trace</TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1">
                    <TabsContent value="overview" className="p-4 space-y-6 m-0">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Cpu className="h-3 w-3" /> Tokens
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">{stats.tokens.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Coins className="h-3 w-3" /> Cost
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-2xl font-bold">${stats.cost.toFixed(4)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator />

                        {/* Model Info */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Brain className="h-4 w-4 text-purple-500" />
                                Model Configuration
                            </h4>
                            <div className="grid gap-2 text-sm max-w-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Provider</span>
                                    <span className="font-medium capitalize">{session.metadata?.provider || "Default"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Model</span>
                                    <span className="font-medium">{session.metadata?.model || "Auto"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Temperature</span>
                                    <span className="font-medium">{session.metadata?.temperature || "0.7"}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Active Agents */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Layers className="h-4 w-4 text-blue-500" />
                                Participating Agents
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="gap-1 pl-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Orchestrator
                                </Badge>
                                {session.metadata?.agentId && (
                                    <Badge variant="outline" className="gap-1 pl-1 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        {session.metadata.agentId}
                                    </Badge>
                                )}
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="content" className="p-4 m-0">
                        {generatedContent.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No content generated yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {generatedContent.map((item) => (
                                    <Card key={item.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm font-medium truncate">
                                                {item.summary}
                                            </CardTitle>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="debug" className="p-4 m-0">
                        <div className="space-y-4">
                            {session.messages.map((msg, i) => (
                                <div key={i} className="text-xs font-mono border rounded p-2 bg-muted/30">
                                    <div className="flex justify-between mb-1 opacity-70">
                                        <span className="uppercase font-bold">{msg.role}</span>
                                        <span>{msg.metadata?.duration ? `${(msg.metadata.duration / 1000).toFixed(2)}s` : ''}</span>
                                    </div>
                                    <div className="truncate opacity-50">{msg.content.slice(0, 100)}...</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    )
}
