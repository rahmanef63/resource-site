/**
 * User Status Panel
 * 
 * Bottom panel showing current user with status, mic, and settings controls.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Mic,
    MicOff,
    Headphones,
    HeadphoneOff,
    Settings,
    Circle,
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserStatus = "online" | "idle" | "dnd" | "invisible" | "offline"

interface UserStatusPanelProps {
    user?: {
        id: string
        name: string
        username?: string
        avatar?: string
        status?: UserStatus
        customStatus?: string
    }
    isMuted?: boolean
    isDeafened?: boolean
    onMuteToggle?: () => void
    onDeafenToggle?: () => void
    onSettingsClick?: () => void
    onStatusChange?: (status: UserStatus) => void
    className?: string
}

export function UserStatusPanel({
    user = {
        id: "1",
        name: "User",
        username: "user",
        status: "online",
    },
    isMuted = false,
    isDeafened = false,
    onMuteToggle,
    onDeafenToggle,
    onSettingsClick,
    onStatusChange,
    className,
}: UserStatusPanelProps) {
    const statusColors: Record<UserStatus, string> = {
        online: "bg-green-500",
        idle: "bg-yellow-500",
        dnd: "bg-red-500",
        invisible: "bg-gray-400",
        offline: "bg-gray-400",
    }

    const statusLabels: Record<UserStatus, string> = {
        online: "Online",
        idle: "Idle",
        dnd: "Do Not Disturb",
        invisible: "Invisible",
        offline: "Offline",
    }

    return (
        <TooltipProvider delayDuration={0}>
            <div className={cn(
                "flex items-center gap-2 px-2 py-2 bg-muted/70",
                className
            )}>
                {/* User Avatar with Status Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative flex items-center gap-2 flex-1 min-w-0 p-1 rounded hover:bg-accent transition-colors">
                            <div className="relative shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="text-xs font-medium">
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-muted",
                                    statusColors[user.status || "online"]
                                )} />
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate leading-tight">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate leading-tight">
                                    {user.customStatus || statusLabels[user.status || "online"]}
                                </p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-56">
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => onStatusChange?.("online")}
                            className="gap-2"
                        >
                            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                            <span>Online</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onStatusChange?.("idle")}
                            className="gap-2"
                        >
                            <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span>Idle</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onStatusChange?.("dnd")}
                            className="gap-2"
                        >
                            <Circle className="h-3 w-3 fill-red-500 text-red-500" />
                            <span>Do Not Disturb</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => onStatusChange?.("invisible")}
                            className="gap-2"
                        >
                            <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                            <span>Invisible</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="gap-2">
                            <span className="text-xs">Set Custom Status</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Control Buttons */}
                <div className="flex items-center gap-0.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Mute microphone"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8",
                                    isMuted && "text-destructive hover:text-destructive"
                                )}
                                onClick={onMuteToggle}
                            >
                                {isMuted ? (
                                    <MicOff className="h-4 w-4" />
                                ) : (
                                    <Mic className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isMuted ? "Unmute" : "Mute"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Leave call"
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8",
                                    isDeafened && "text-destructive hover:text-destructive"
                                )}
                                onClick={onDeafenToggle}
                            >
                                {isDeafened ? (
                                    <HeadphoneOff className="h-4 w-4" />
                                ) : (
                                    <Headphones className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isDeafened ? "Undeafen" : "Deafen"}
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Settings"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onSettingsClick}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            User Settings
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}

export default UserStatusPanel
