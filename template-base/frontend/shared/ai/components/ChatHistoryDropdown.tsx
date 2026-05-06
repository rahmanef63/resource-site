"use client"

import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { History, MessageSquarePlus, Trash2, Check, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAIStore } from "../stores"
import { useAIActions } from "../hooks"
import { cn } from "@/lib/utils"

interface ChatHistoryDropdownProps {
    className?: string
}

export function ChatHistoryDropdown({ className }: ChatHistoryDropdownProps) {
    const sessions = useAIStore((s) => s.sessions)
    const selectedSessionId = useAIStore((s) => s.selectedSessionId)
    const { selectSession, createSession, deleteSession } = useAIActions()

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)
    }, [sessions])

    const handleNewChat = async () => {
        try {
            const session = await createSession("New Chat")
            if (session) {
                selectSession(session._id)
            }
        } catch (error) {
            console.error("Failed to create new chat:", error)
        }
    }

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation()
        try {
            await deleteSession(sessionId as any)
        } catch (error) {
            console.error("Failed to delete session:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
                    <History className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Chat History</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Recent Chats</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleNewChat}
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    <DropdownMenuGroup className="p-1">
                        {sortedSessions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                No recent chats
                            </div>
                        ) : (
                            sortedSessions.map((session) => (
                                <DropdownMenuItem
                                    key={session._id}
                                    className={cn(
                                        "flex items-start gap-2 p-2 cursor-pointer group",
                                        selectedSessionId === session._id && "bg-accent"
                                    )}
                                    onClick={() => selectSession(session._id)}
                                >
                                    <MessageSquare className="h-4 w-4 mt-1 shrink-0 opacity-50" />
                                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                        <span className={cn(
                                            "truncate text-sm font-medium",
                                            selectedSessionId === session._id && "text-primary"
                                        )}>
                                            {session.title || "Untitled Chat"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                        </span>
                                    </div>
                                    {selectedSessionId === session._id && (
                                        <Check className="h-3 w-3 mt-1 text-primary shrink-0" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0"
                                        onClick={(e) => handleDeleteSession(e, session._id)}
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuGroup>
                </ScrollArea>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleNewChat} className="cursor-pointer">
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    <span>New Chat</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
