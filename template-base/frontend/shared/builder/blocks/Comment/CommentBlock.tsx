/**
 * Comment Block
 * 
 * Threaded comments and discussion.
 */

"use client"

import * as React from "react"
import { MessageSquare, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BlockCard } from "../shared"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============================================================================
// Types
// ============================================================================

export interface CommentItem {
    id: string
    author: {
        name: string
        avatar?: string
        initials?: string
    }
    content: string
    timestamp: Date | number
    replies?: CommentItem[]
}

export interface CommentBlockProps {
    comments: CommentItem[]
    title?: string
    description?: string
    className?: string
    onAddComment?: (content: string) => void
    currentUser?: {
        name: string
        avatar?: string
    }
}

// ============================================================================
// Comment Block
// ============================================================================

function CommentRow({ comment }: { comment: CommentItem }) {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback>{comment.author.initials || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/40 p-2 rounded-md">
                    {comment.content}
                </p>
                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 space-y-3 pl-4 border-l-2">
                        {comment.replies.map(reply => <CommentRow key={reply.id} comment={reply} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

export function CommentBlock({
    comments,
    title = "Comments",
    description,
    className,
    onAddComment,
    currentUser,
}: CommentBlockProps) {
    const [newComment, setNewComment] = React.useState("")

    const handleSubmit = () => {
        if (!newComment.trim()) return
        onAddComment?.(newComment)
        setNewComment("")
    }

    return (
        <BlockCard
            header={{
                title,
                description,
                icon: MessageSquare,
            }}
            className={className}
        >
            <div className="flex flex-col h-[400px]">
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6">
                        {comments.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10">
                                No comments yet. Be the first to start the discussion!
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentRow key={comment.id} comment={comment} />
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="mt-4 pt-4 border-t flex gap-3 items-end">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="min-h-[40px] max-h-[120px]"
                        />
                        <Button size="icon" onClick={handleSubmit}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </BlockCard>
    )
}
