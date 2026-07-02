/**
 * Server Header
 * 
 * Workspace header with dropdown menu for settings and actions.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    ChevronDown,
    Settings,
    UserPlus,
    FolderPlus,
    Bell,
    Upload,
    LogOut,
    Shield,
    Hash,
    Sparkles,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ServerHeaderProps {
    workspaceName?: string
    boostLevel?: number
    onInvite?: () => void
    onSettings?: () => void
    onCreateChannel?: () => void
    onCreateCategory?: () => void
    onNotificationSettings?: () => void
    onLeave?: () => void
    className?: string
}

export function ServerHeader({
    workspaceName = "Workspace",
    boostLevel = 0,
    onInvite,
    onSettings,
    onCreateChannel,
    onCreateCategory,
    onNotificationSettings,
    onLeave,
    className,
}: ServerHeaderProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "flex items-center justify-between w-full px-4 h-12",
                    "bg-muted/30 hover:bg-muted/50 transition-colors",
                    "border-b shadow-sm",
                    className
                )}>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm truncate">
                            {workspaceName}
                        </span>
                        {boostLevel > 0 && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">
                                <Sparkles className="h-3 w-3" />
                                {boostLevel}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={onInvite} className="gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <span>Invite People</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onSettings} className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Workspace Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onCreateChannel} className="gap-2">
                    <Hash className="h-4 w-4" />
                    <span>Create Channel</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onCreateCategory} className="gap-2">
                    <FolderPlus className="h-4 w-4" />
                    <span>Create Category</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onNotificationSettings} className="gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notification Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Privacy Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={onLeave}
                    className="gap-2 text-destructive focus:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Leave Workspace</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ServerHeader
