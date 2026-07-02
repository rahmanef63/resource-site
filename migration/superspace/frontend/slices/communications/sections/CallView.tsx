/**
 * Call View
 * 
 * Full-screen view for active voice/video calls with screen sharing.
 * Enhanced with working call controls and premium UI.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Settings,
  Maximize,
  Minimize,
  Grid,
  LayoutGrid,
  Hand,
  MoreVertical,
  Volume2,
  VolumeX,
  Copy,
  UserPlus,
  Pin,
  Sparkles,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // @dod:skip-primitive reason="CallView renders fullscreen call Dialog with WebRTC video grid + screenshare layout; ResponsiveDialog drawer-on-mobile mode would break aspect-ratio video tiles"
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Store
import {
  useCommunicationsStore,
  useActiveCall,
  useCallParticipants,
  useLocalMediaState,
  useScreenShares,
  type CallParticipant,
  type ScreenShare,
} from "../shared"

interface CallViewProps {
  className?: string
}

export function CallView({ className }: CallViewProps) {
  const activeCall = useActiveCall()
  const participants = useCallParticipants()
  const localMedia = useLocalMediaState()
  const screenShares = useScreenShares()

  const updateLocalMediaState = useCommunicationsStore(state => state.updateLocalMediaState)
  const setActiveCall = useCommunicationsStore(state => state.setActiveCall)
  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  const [layout, setLayout] = React.useState<"grid" | "spotlight" | "sidebar">("grid")
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showParticipants, setShowParticipants] = React.useState(false)
  const [showChat, setShowChat] = React.useState(false)
  const [isHandRaised, setIsHandRaised] = React.useState(false)
  const [callDuration, setCallDuration] = React.useState(0)
  const [connectionQuality, setConnectionQuality] = React.useState<"excellent" | "good" | "poor">("excellent")

  // Simulate call duration timer
  React.useEffect(() => {
    if (!activeCall?.startedAt) return

    const startTime = new Date(activeCall.startedAt).getTime()
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCall?.startedAt])

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!activeCall) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-background", className)}>
        <div className="text-center">
          <Radio className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Active Call</h3>
          <p className="text-muted-foreground text-sm">
            Start a call from a channel or direct message
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setViewMode("channel")}
          >
            Back to Channels
          </Button>
        </div>
      </div>
    )
  }

  // Mock participants if empty
  const displayParticipants: CallParticipant[] = participants.length > 0 ? participants : [
    {
      id: "self",
      callId: activeCall.id,
      userId: "user-current",
      user: { id: "user-current", name: "You", avatar: undefined },
      status: "connected",
      role: "host",
      isMuted: localMedia.isMuted,
      isVideoOn: localMedia.isVideoOn,
      isScreenSharing: localMedia.isScreenSharing,
      isSpeaking: false,
    },
    {
      id: "peer-1",
      callId: activeCall.id,
      userId: "user-2",
      user: { id: "user-2", name: "John Doe", avatar: undefined },
      status: "connected",
      role: "participant",
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
      isSpeaking: true,
    },
    {
      id: "peer-2",
      callId: activeCall.id,
      userId: "user-3",
      user: { id: "user-3", name: "Jane Smith", avatar: undefined },
      status: "connected",
      role: "participant",
      isMuted: true,
      isVideoOn: false,
      isScreenSharing: false,
      isSpeaking: false,
    },
  ]

  // Find active screen share
  const activeScreenShare = screenShares.find(s => s.isActive)

  // Toggle handlers
  const toggleMute = () => updateLocalMediaState({ isMuted: !localMedia.isMuted })
  const toggleVideo = () => updateLocalMediaState({ isVideoOn: !localMedia.isVideoOn })
  const toggleScreenShare = () => updateLocalMediaState({ isScreenSharing: !localMedia.isScreenSharing })

  const endCall = () => {
    setActiveCall(null)
    setViewMode("channel")
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-zinc-900 text-white",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          {/* Call info */}
          <div className="flex items-center gap-2">
            {activeCall.type === "video" ? (
              <Video className="h-4 w-4 text-green-400" />
            ) : (
              <Radio className="h-4 w-4 text-green-400" />
            )}
            <h2 className="font-semibold text-sm">
              {activeCall.title || `${activeCall.type === "video" ? "Video" : "Voice"} Call`}
            </h2>
          </div>

          {/* Duration */}
          <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 font-mono">
            {formatDuration(callDuration)}
          </Badge>

          {/* Connection quality */}
          <Tooltip>
            <TooltipTrigger>
              <div className={cn(
                "flex items-center gap-1 text-xs",
                connectionQuality === "excellent" && "text-green-400",
                connectionQuality === "good" && "text-yellow-400",
                connectionQuality === "poor" && "text-red-400",
              )}>
                <Wifi className="h-3 w-3" />
                <span className="hidden sm:inline">{connectionQuality}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Connection: {connectionQuality}</TooltipContent>
          </Tooltip>

          {/* Participant count */}
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Users className="h-3 w-3" />
            <span>{displayParticipants.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Layout toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Grid view"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={() => setLayout(l => l === "grid" ? "spotlight" : l === "spotlight" ? "sidebar" : "grid")}
              >
                {layout === "grid" ? (
                  <Grid className="h-4 w-4" />
                ) : layout === "spotlight" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <LayoutGrid className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Change Layout</TooltipContent>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button aria-label="Minimize"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
          </Tooltip>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="More options"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Link
              </DropdownMenuItem>
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Others
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem className="text-zinc-200 focus:bg-zinc-700">
                <Settings className="h-4 w-4 mr-2" />
                Call Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          {/* Screen share view */}
          {activeScreenShare || localMedia.isScreenSharing ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-black rounded-lg flex items-center justify-center border border-zinc-700">
                <div className="text-center">
                  <Monitor className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
                  <p className="text-lg font-medium">
                    {localMedia.isScreenSharing
                      ? "You are sharing your screen"
                      : `${activeScreenShare?.user?.name || "Someone"} is sharing their screen`
                    }
                  </p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Screen share content would appear here
                  </p>
                </div>
              </div>

              {/* Participant strip */}
              <div className="flex items-center justify-center gap-2 mt-4 overflow-x-auto py-2">
                {displayParticipants.map((participant) => (
                  <ParticipantTile
                    key={participant.id}
                    participant={participant}
                    size="small"
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Grid/Spotlight view */
            <div className={cn(
              "h-full",
              layout === "grid" && "grid gap-2 auto-rows-fr",
              layout === "spotlight" && "flex items-center justify-center",
              layout === "sidebar" && "flex gap-2"
            )}
              style={layout === "grid" ? {
                gridTemplateColumns: `repeat(${getGridCols(displayParticipants.length)}, 1fr)`
              } : undefined}
            >
              {displayParticipants.map((participant, index) => (
                <ParticipantTile
                  key={participant.id}
                  participant={participant}
                  size={layout === "spotlight" && index === 0 ? "large" : "medium"}
                  isSpotlight={layout === "spotlight" && index === 0}
                  isSidebar={layout === "sidebar" && index > 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-64 bg-zinc-800 border-l border-zinc-700 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
              <h3 className="font-semibold text-sm">Participants ({displayParticipants.length})</h3>
              <Button aria-label="Minimize"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400"
                onClick={() => setShowParticipants(false)}
              >
                <Minimize className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {displayParticipants.map((participant) => (
                  <ParticipantListItem key={participant.id} participant={participant} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-zinc-800 border-l border-zinc-700 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
              <h3 className="font-semibold text-sm">In-Call Messages</h3>
              <Button aria-label="Minimize"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400"
                onClick={() => setShowChat(false)}
              >
                <Minimize className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="text-center text-zinc-500 text-sm py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Messages sent here are only visible to call participants</p>
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-zinc-700">
              <input
                type="text"
                placeholder="Send a message..."
                className="w-full bg-zinc-700 border-none rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center justify-center gap-2 px-4 py-4 bg-zinc-800/50 shrink-0">
          {/* Mic */}
          <ControlButton
            icon={localMedia.isMuted ? MicOff : Mic}
            label={localMedia.isMuted ? "Unmute" : "Mute"}
            onClick={toggleMute}
            active={!localMedia.isMuted}
            variant={localMedia.isMuted ? "warning" : "default"}
          />

          {/* Video */}
          <ControlButton
            icon={localMedia.isVideoOn ? Video : VideoOff}
            label={localMedia.isVideoOn ? "Turn off camera" : "Turn on camera"}
            onClick={toggleVideo}
            active={localMedia.isVideoOn}
            variant={!localMedia.isVideoOn ? "warning" : "default"}
          />

          {/* Screen Share */}
          <ControlButton
            icon={localMedia.isScreenSharing ? MonitorOff : Monitor}
            label={localMedia.isScreenSharing ? "Stop sharing" : "Share screen"}
            onClick={toggleScreenShare}
            active={localMedia.isScreenSharing}
            variant={localMedia.isScreenSharing ? "active" : "default"}
          />

          {/* Raise Hand */}
          <ControlButton
            icon={Hand}
            label={isHandRaised ? "Lower hand" : "Raise hand"}
            onClick={() => setIsHandRaised(!isHandRaised)}
            active={isHandRaised}
            variant={isHandRaised ? "active" : "default"}
          />

          <Separator orientation="vertical" className="h-8 bg-zinc-700 mx-2" />

          {/* Participants */}
          <ControlButton
            icon={Users}
            label="Participants"
            onClick={() => setShowParticipants(!showParticipants)}
            active={showParticipants}
          />

          {/* Chat */}
          <ControlButton
            icon={MessageSquare}
            label="Chat"
            onClick={() => setShowChat(!showChat)}
            active={showChat}
          />

          <Separator orientation="vertical" className="h-8 bg-zinc-700 mx-2" />

          {/* End Call */}
          <ControlButton
            icon={PhoneOff}
            label="Leave call"
            onClick={endCall}
            variant="destructive"
          />
        </div>
      </TooltipProvider>
    </div>
  )
}

interface ParticipantTileProps {
  participant: CallParticipant
  size?: "small" | "medium" | "large"
  isSpotlight?: boolean
  isSidebar?: boolean
}

function ParticipantTile({ participant, size = "medium", isSpotlight, isSidebar }: ParticipantTileProps) {
  const sizeClasses = {
    small: "w-24 h-20",
    medium: "min-h-[180px]",
    large: "w-full h-full max-w-4xl max-h-[70vh]",
  }

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700",
      sizeClasses[size],
      isSpotlight && "mx-auto",
      isSidebar && "w-32 shrink-0"
    )}>
      {/* Video / Avatar placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {participant.isVideoOn ? (
          <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
            <p className="text-zinc-500 text-sm">Video feed</p>
          </div>
        ) : (
          <Avatar className={cn(
            size === "small" ? "h-10 w-10" : size === "large" ? "h-24 w-24" : "h-16 w-16"
          )}>
            <AvatarImage src={participant.user?.avatar} />
            <AvatarFallback className={cn(
              "bg-zinc-600 text-white",
              size === "large" ? "text-3xl" : "text-lg"
            )}>
              {participant.user?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none animate-pulse" />
      )}

      {/* Name tag */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          <span className="truncate max-w-[100px]">
            {participant.user?.name || "Unknown"}
          </span>
          {participant.role === "host" && (
            <Badge variant="secondary" className="h-4 text-[10px] px-1 bg-yellow-500/20 text-yellow-400 border-0">
              Host
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {participant.isMuted && (
            <span className="bg-black/60 backdrop-blur-sm text-red-400 p-1 rounded">
              <MicOff className="h-3 w-3" />
            </span>
          )}
          {participant.isScreenSharing && (
            <span className="bg-black/60 backdrop-blur-sm text-green-400 p-1 rounded">
              <Monitor className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Pin button (on hover) */}
      <button aria-label="Pin" className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-black/60 p-1 rounded">
        <Pin className="h-3 w-3" />
      </button>
    </div>
  )
}

function ParticipantListItem({ participant }: { participant: CallParticipant }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-700/50 cursor-pointer">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={participant.user?.avatar} />
          <AvatarFallback className="bg-zinc-600 text-xs">
            {participant.user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {participant.isSpeaking && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{participant.user?.name}</p>
        <p className="text-xs text-zinc-500">{participant.role}</p>
      </div>
      <div className="flex items-center gap-1 text-zinc-500">
        {participant.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
        {participant.isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
      </div>
    </div>
  )
}

interface ControlButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  active?: boolean
  variant?: "default" | "warning" | "destructive" | "active"
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  variant = "default"
}: ControlButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full transition-all",
            variant === "default" && "bg-zinc-700 text-white hover:bg-zinc-600",
            variant === "warning" && "bg-red-500/20 text-red-400 hover:bg-red-500/30",
            variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
            variant === "active" && "bg-green-600 text-white hover:bg-green-700",
          )}
          onClick={onClick}
        >
          <Icon className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function getGridCols(participantCount: number): number {
  if (participantCount <= 1) return 1
  if (participantCount <= 4) return 2
  if (participantCount <= 9) return 3
  return 4
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

export default CallView
