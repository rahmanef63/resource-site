/**
 * Channel Header
 * 
 * Header bar for channels with channel info and action buttons.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Hash,
    Volume2,
    Video,
    Megaphone,
    MessageSquare,
    Users,
    Phone,
    Pin,
    Search,
    Bell,
    BellOff,
    Settings,
    Inbox,
    HelpCircle,
    AtSign,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Store
import { type Channel } from "../shared"

// Channel type icons
const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    text: Hash,
    voice: Volume2,
    video: Video,
    announcement: Megaphone,
    forum: MessageSquare,
}

interface ChannelHeaderProps {
    channel: Channel | null
    memberCount?: number
    pinnedCount?: number
    isMuted?: boolean
    onMembersClick?: () => void
    onPinnedClick?: () => void
    onThreadsClick?: () => void
    onNotificationClick?: () => void
    onSearchClick?: () => void
    onStartCall?: () => void
    onStartVideoCall?: () => void
    className?: string
}

export function ChannelHeader({
    channel,
    memberCount = 0,
    pinnedCount = 0,
    isMuted = false,
    onMembersClick,
    onPinnedClick,
    onThreadsClick,
    onNotificationClick,
    onSearchClick,
    onStartCall,
    onStartVideoCall,
    className,
}: ChannelHeaderProps) {
    const [searchOpen, setSearchOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    if (!channel) {
        return (
            <div className={cn("flex items-center h-10 px-4 border-b bg-background", className)}>
                <span className="text-muted-foreground text-sm">No channel selected</span>
            </div>
        )
    }

    const Icon = channelIcons[channel.type] || Hash
    const isVoiceChannel = channel.type === "voice" || channel.type === "video"

    return (
        <TooltipProvider delayDuration={0}>
            <div className={cn(
                "flex items-center h-10 px-4 border-b bg-background shrink-0 gap-2",
                className
            )}>
                {/* Channel Info */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <h2 className="font-semibold text-sm truncate">{channel.name}</h2>

                    {channel.topic && (
                        <>
                            <Separator orientation="vertical" className="h-5" />
                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {channel.topic}
                            </p>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-0.5">
                    {/* Voice/Video Call buttons for text channels */}
                    {!isVoiceChannel && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button aria-label="Call"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={onStartCall}
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start Voice Call</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button aria-label="Video"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={onStartVideoCall}
                                    >
                                        <Video className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Start Video Call</TooltipContent>
                            </Tooltip>
                        </>
                    )}

                    {/* Threads */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Messages"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onThreadsClick}
                            >
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Threads</TooltipContent>
                    </Tooltip>

                    {/* Pinned Messages */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Pin"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 relative"
                                onClick={onPinnedClick}
                            >
                                <Pin className="h-4 w-4" />
                                {pinnedCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                                        {pinnedCount}
                                    </span>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Pinned Messages</TooltipContent>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Mute notifications"
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8", isMuted && "text-muted-foreground")}
                                onClick={onNotificationClick}
                            >
                                {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isMuted ? "Unmute Channel" : "Mute Channel"}</TooltipContent>
                    </Tooltip>

                    {/* Members Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Members"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={onMembersClick}
                            >
                                <Users className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {memberCount > 0 ? `${memberCount} Members` : "Member List"}
                        </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-5 mx-1" />

                    {/* Search */}
                    <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button aria-label="Search"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Search</TooltipContent>
                        </Tooltip>
                        <PopoverContent align="end" className="w-80 p-2">
                            <Input
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8"
                                autoFocus
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-1">
                                    <span className="font-medium">from:</span> user
                                </p>
                                <p className="flex items-center gap-1">
                                    <span className="font-medium">has:</span> link, file, embed
                                </p>
                                <p className="flex items-center gap-1">
                                    <span className="font-medium">before/after:</span> date
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Inbox */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Inbox" variant="ghost" size="icon" className="h-8 w-8">
                                <Inbox className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Inbox</TooltipContent>
                    </Tooltip>

                    {/* Help */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button aria-label="Help" variant="ghost" size="icon" className="h-8 w-8">
                                <HelpCircle className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Help</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    )
}

export default ChannelHeader
