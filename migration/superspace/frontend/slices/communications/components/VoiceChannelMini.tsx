/**
 * Voice Channel Mini
 * 
 * Mini player that shows when user is in a voice call but browsing other channels.
 * Displays above the UserStatusPanel in the sidebar.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    Mic,
    MicOff,
    PhoneOff,
    Video,
    VideoOff,
    Monitor,
    Maximize2,
    Signal,
    Users,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Store
import {
    useCommunicationsStore,
    useActiveCall,
    useLocalMediaState,
    useCallParticipants,
} from "../shared"

interface VoiceChannelMiniProps {
    className?: string
}

export function VoiceChannelMini({ className }: VoiceChannelMiniProps) {
    const activeCall = useActiveCall()
    const localMedia = useLocalMediaState()
    const participants = useCallParticipants()

    const updateLocalMediaState = useCommunicationsStore(state => state.updateLocalMediaState)
    const setActiveCall = useCommunicationsStore(state => state.setActiveCall)
    const setViewMode = useCommunicationsStore(state => state.setViewMode)

    const [callDuration, setCallDuration] = React.useState(0)

    // Call duration timer
    React.useEffect(() => {
        if (!activeCall?.startedAt) return

        const startTime = new Date(activeCall.startedAt).getTime()
        const interval = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)

        return () => clearInterval(interval)
    }, [activeCall?.startedAt])

    // If no active call, don't render
    if (!activeCall) return null

    const toggleMute = () => updateLocalMediaState({ isMuted: !localMedia.isMuted })

    const endCall = () => {
        setActiveCall(null)
    }

    const expandCall = () => {
        setViewMode("call")
    }

    // Mock participant count
    const participantCount = participants.length > 0 ? participants.length : 3

    return (
        <TooltipProvider delayDuration={0}>
            <div className={cn(
                "bg-zinc-800 border-t border-zinc-700",
                className
            )}>
                {/* Call info */}
                <div className="px-3 py-2 border-b border-zinc-700/50">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Signal className="h-4 w-4 text-green-400" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-green-400 truncate">
                                Voice Connected
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                                {activeCall.title || "Voice Channel"}
                            </p>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                            {formatDuration(callDuration)}
                        </span>
                    </div>
                </div>

                {/* Participants preview */}
                <div className="px-3 py-2 border-b border-zinc-700/50">
                    <div className="flex items-center gap-2">
                        {/* Stacked avatars */}
                        <div className="flex -space-x-2">
                            {[1, 2, 3].slice(0, Math.min(participantCount, 3)).map((_, i) => (
                                <Avatar key={i} className="h-6 w-6 border-2 border-zinc-800">
                                    <AvatarFallback className="text-[10px] bg-zinc-600">
                                        {["Y", "J", "S"][i]}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {participantCount > 3 && (
                                <div className="h-6 w-6 rounded-full bg-zinc-600 border-2 border-zinc-800 flex items-center justify-center">
                                    <span className="text-[10px] text-zinc-300">+{participantCount - 3}</span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-zinc-400">
                            {participantCount} {participantCount === 1 ? "participant" : "participants"}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-1">
                        {/* Mute */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button aria-label="Mute microphone"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-full",
                                        localMedia.isMuted
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                    )}
                                    onClick={toggleMute}
                                >
                                    {localMedia.isMuted ? (
                                        <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{localMedia.isMuted ? "Unmute" : "Mute"}</TooltipContent>
                        </Tooltip>

                        {/* Screen share indicator */}
                        {localMedia.isScreenSharing && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                                <Monitor className="h-3 w-3" />
                                <span className="hidden sm:inline">Sharing</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Expand */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button aria-label="Maximize"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                    onClick={expandCall}
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Open Call View</TooltipContent>
                        </Tooltip>

                        {/* Disconnect */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button aria-label="End call"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
                                    onClick={endCall}
                                >
                                    <PhoneOff className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Disconnect</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}

function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default VoiceChannelMini
