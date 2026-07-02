"use client"

import * as React from "react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { MessageSquare, UserMinus, User, Ban } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

interface ContactContextMenuProps {
    children: React.ReactNode
    contactId: Id<"users">
    contactName: string
    onRemove?: () => void
    onMessage?: () => void
    onViewProfile?: () => void
}

export function ContactContextMenu({
    children,
    contactId,
    contactName,
    onRemove,
    onMessage,
    onViewProfile,
}: ContactContextMenuProps) {
    const router = useRouter()

    // Chat mutations removed as we rely on parent callbacks

    const handleMessage = () => {
        if (onMessage) {
            onMessage();
        } else {

        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onClick={handleMessage}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                </ContextMenuItem>
                <ContextMenuItem onClick={onViewProfile}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onRemove} className="text-red-600">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Remove Contact
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
