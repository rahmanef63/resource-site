/**
 * Inspector Panel
 * 
 * Right panel that shows detailed information about the selected channel or DM.
 * Supports different views: details, members, threads, search, ai.
 * Uses PanelRoot/PanelHeader/PanelBody/PanelFooter for consistent layout.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  X,
  Crown,
  Shield,
  Circle,
  Hash,
  Volume2,
  Video,
  Lock,
  Bell,
  BellOff,
  Pin,
  Archive,
  Trash2,
  Settings,
  Users,
  Info,
  Search,
  Bot,
  MessageSquare,
  Calendar,
  Link,
  Copy,
  Check,
  ChevronRight,
  AtSign,
  FileText,
  Image,
  Paperclip,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Layout Components
import { PanelRoot, PanelHeader, PanelBody } from "@/frontend/shared/ui/layout"

// Store and types
import {
  useCommunicationsStore,
  useSelectedChannel,
  useSelectedDirectId,
  useDirectConversations,
  useViewMode,
  useRightPanelContent,
  type Channel,
  type DirectConversation,
  type PresenceStatus,
} from "../shared"

// Hooks
import { useChannel } from "../hooks/useChannels"
import { useDirectConversations as useDirectConversationsQuery } from "../hooks/useDirectMessages"
import { useCommunicationWorkspace } from "../hooks/useCommunicationWorkspace"

interface InspectorPanelProps {
  className?: string
}

export function InspectorPanel({ className }: InspectorPanelProps) {
  const viewMode = useViewMode()
  const rightPanelContent = useRightPanelContent()
  const toggleRightPanel = useCommunicationsStore(state => state.toggleRightPanel)
  const setRightPanelContent = useCommunicationsStore(state => state.setRightPanelContent)

  // Channel data
  const selectedChannelId = useCommunicationsStore(state => state.channel.selectedChannelId)
  const { channel } = useChannel(selectedChannelId || undefined)

  // DM data
  const selectedDirectId = useSelectedDirectId()
  const { activeWorkspaceId } = useCommunicationWorkspace()
  const { conversations } = useDirectConversationsQuery({
    workspaceId: activeWorkspaceId ?? undefined,
  })
  const selectedConversation = conversations.find(c => c.id === selectedDirectId)

  // Determine what to show
  const isChannel = viewMode === "channel"
  const isDM = viewMode === "dm"

  // Get display data
  const displayData = isChannel ? channel : selectedConversation

  if (!displayData) {
    return (
      <PanelRoot className={cn("border-l bg-background", className)}>
        <PanelHeader border padding="md" className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Details</h3>
          <Button aria-label="Close" variant="ghost" size="icon" className="h-7 w-7" onClick={toggleRightPanel}>
            <X className="h-4 w-4" />
          </Button>
        </PanelHeader>
        <PanelBody className="flex items-center justify-center text-muted-foreground text-sm">
          Select a channel or conversation
        </PanelBody>
      </PanelRoot>
    )
  }

  return (
    <PanelRoot className={cn("border-l bg-background", className)}>
      {isChannel ? (
        <ChannelInspector channel={channel!} onClose={toggleRightPanel} />
      ) : (
        <DMInspector conversation={selectedConversation!} onClose={toggleRightPanel} />
      )}
    </PanelRoot>
  )
}

// =============================================================================
// CHANNEL INSPECTOR
// =============================================================================

interface ChannelInspectorProps {
  channel: Channel
  onClose: () => void
}

function ChannelInspector({ channel, onClose }: ChannelInspectorProps) {
  const [activeTab, setActiveTab] = React.useState("details")
  const [copied, setCopied] = React.useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ChannelIcon = channel.type === "voice" ? Volume2 : channel.type === "video" ? Video : Hash

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <ChannelIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1">
                {channel.isPrivate && <Lock className="h-3 w-3" />}
                {channel.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">{channel.type} channel</p>
            </div>
          </div>
          <Button aria-label="Close" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2">
          <TabsList className="w-full h-9 bg-transparent p-0 justify-evenly gap-1">
            <TabsTrigger value="details" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Details
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Members
            </TabsTrigger>
            <TabsTrigger value="media" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Media
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === "details" && (
          <div className="p-4 space-y-4">
            {/* Description */}
            {channel.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">Description</h4>
                <p className="text-sm">{channel.description}</p>
              </div>
            )}

            {/* Topic */}
            {channel.topic && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">Topic</h4>
                <p className="text-sm">{channel.topic}</p>
              </div>
            )}

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Actions</h4>
              <QuickActionButton icon={Bell} label="Mute Channel" />
              <QuickActionButton icon={Pin} label="Pin Channel" />
              <QuickActionButton 
                icon={copied ? Check : Link} 
                label={copied ? "Copied!" : "Copy Link"} 
                onClick={handleCopyLink}
              />
            </div>

            <Separator />

            {/* Channel Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Information</h4>
              <InfoRow icon={Calendar} label="Created" value="Dec 1, 2024" />
              <InfoRow icon={MessageSquare} label="Messages" value={channel.messageCount?.toString() || "0"} />
              <InfoRow icon={Users} label="Members" value={channel.memberCount?.toString() || "1"} />
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <ChannelMembersTab />
        )}

        {activeTab === "media" && (
          <MediaTab />
        )}
      </ScrollArea>
    </>
  )
}

// =============================================================================
// DM INSPECTOR
// =============================================================================

interface DMInspectorProps {
  conversation: DirectConversation
  onClose: () => void
}

function DMInspector({ conversation, onClose }: DMInspectorProps) {
  const [activeTab, setActiveTab] = React.useState("details")
  const [copied, setCopied] = React.useState(false)

  // Get the other participant(s) for display
  const otherParticipants = conversation.participants?.filter(p => p.user) || []
  const primaryParticipant = otherParticipants[0]?.user
  const isGroup = otherParticipants.length > 1

  const displayName = conversation.name || primaryParticipant?.name || "Conversation"
  const displayAvatar = primaryParticipant?.avatar

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {primaryParticipant?.status && (
                <StatusIndicator status={primaryParticipant.status} className="absolute bottom-0 right-0" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{displayName}</h3>
              <p className="text-xs text-muted-foreground">
                {isGroup ? `${otherParticipants.length} members` : primaryParticipant?.status || "offline"}
              </p>
            </div>
          </div>
          <Button aria-label="Close" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2">
          <TabsList className="w-full h-9 bg-transparent p-0 justify-evenly gap-1">
            <TabsTrigger value="details" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              Details
            </TabsTrigger>
            {isGroup && (
              <TabsTrigger value="members" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Members
              </TabsTrigger>
            )}
            <TabsTrigger value="media" className="text-xs h-8 px-3 data-[state=active]:bg-muted">
              <Image className="h-3.5 w-3.5 mr-1.5" />
              Media
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === "details" && (
          <div className="p-4 space-y-4">
            {/* User/Group Info Card */}
            {!isGroup && primaryParticipant && (
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3">
                  <AvatarImage src={primaryParticipant.avatar} />
                  <AvatarFallback className="text-2xl">
                    {primaryParticipant.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{primaryParticipant.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <StatusIndicator status={primaryParticipant.status || "offline"} />
                  <span className="text-sm text-muted-foreground capitalize">
                    {primaryParticipant.status || "offline"}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Actions</h4>
              <QuickActionButton icon={Bell} label="Mute Notifications" />
              <QuickActionButton icon={Pin} label="Pin Conversation" />
              <QuickActionButton icon={Archive} label="Archive" />
              <QuickActionButton icon={Trash2} label="Delete Conversation" variant="destructive" />
            </div>

            <Separator />

            {/* Conversation Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">Information</h4>
              <InfoRow 
                icon={Calendar} 
                label="Started" 
                value={conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : "Unknown"} 
              />
              <InfoRow icon={MessageSquare} label="Messages" value="—" />
              {isGroup && (
                <InfoRow icon={Users} label="Participants" value={otherParticipants.length.toString()} />
              )}
            </div>
          </div>
        )}

        {activeTab === "members" && isGroup && (
          <DMParticipantsTab participants={otherParticipants} />
        )}

        {activeTab === "media" && (
          <MediaTab />
        )}
      </ScrollArea>
    </>
  )
}

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function ChannelMembersTab() {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Mock members - would come from useChannelMembers hook
  const members: MemberWithPresence[] = [
    { id: "1", name: "John Doe", avatar: undefined, role: "admin", status: "online" },
    { id: "2", name: "Jane Smith", avatar: undefined, role: "moderator", status: "online" },
    { id: "3", name: "Bob Wilson", avatar: undefined, role: "member", status: "idle" },
    { id: "4", name: "Alice Brown", avatar: undefined, role: "member", status: "dnd" },
    { id: "5", name: "Charlie Davis", avatar: undefined, role: "member", status: "offline" },
  ]

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const { online, offline } = React.useMemo(() => {
    const online: MemberWithPresence[] = []
    const offline: MemberWithPresence[] = []

    for (const member of filteredMembers) {
      if (member.status === "offline") {
        offline.push(member)
      } else {
        online.push(member)
      }
    }

    return { online, offline }
  }, [filteredMembers])

  return (
    <div className="p-2">
      {/* Search */}
      <div className="px-2 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Online members */}
      {online.length > 0 && (
        <MemberSection title={`Online — ${online.length}`} members={online} />
      )}

      {/* Offline members */}
      {offline.length > 0 && (
        <MemberSection title={`Offline — ${offline.length}`} members={offline} />
      )}
    </div>
  )
}

interface DMParticipantsTabProps {
  participants: Array<{
    user?: {
      id: string
      name: string
      avatar?: string
      status?: PresenceStatus
    }
  }>
}

function DMParticipantsTab({ participants }: DMParticipantsTabProps) {
  return (
    <div className="p-2">
      <div className="space-y-0.5">
        {participants.map((p, i) => (
          p.user && (
            <button
              key={p.user.id || i}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-2 rounded-md",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors text-left"
              )}
            >
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={p.user.avatar} />
                  <AvatarFallback>{p.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <StatusIndicator status={p.user.status || "offline"} className="absolute bottom-0 right-0" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">{p.user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{p.user.status || "offline"}</span>
              </div>
            </button>
          )
        ))}
      </div>
    </div>
  )
}

function MediaTab() {
  const [mediaType, setMediaType] = React.useState<"all" | "images" | "files" | "links">("all")

  // Mock media items
  const mediaItems: MediaItem[] = []

  return (
    <div className="p-4">
      {/* Filter buttons */}
      <div className="flex gap-1 mb-4">
        {(["all", "images", "files", "links"] as const).map((type) => (
          <Button
            key={type}
            variant={mediaType === type ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 capitalize"
            onClick={() => setMediaType(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {mediaItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Paperclip className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No {mediaType === "all" ? "media" : mediaType} shared yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {/* Media items would go here */}
        </div>
      )}
    </div>
  )
}

interface MemberWithPresence {
  id: string
  name: string
  avatar?: string
  role: "admin" | "moderator" | "member" | "viewer"
  status: PresenceStatus
}

interface MediaItem {
  id: string
  type: "image" | "file" | "link"
  url: string
  name: string
  timestamp: string
}

interface MemberSectionProps {
  title: string
  members: MemberWithPresence[]
}

function MemberSection({ title, members }: MemberSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-2">
      <CollapsibleTrigger className="flex items-center gap-1 px-2 py-1.5 w-full text-left">
        <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5">
          {members.map((member) => (
            <MemberItem key={member.id} member={member} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function MemberItem({ member }: { member: MemberWithPresence }) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors text-left",
        member.status === "offline" && "opacity-50"
      )}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <StatusIndicator status={member.status} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{member.name}</span>
          <RoleIcon role={member.role} />
        </div>
      </div>
    </button>
  )
}

function StatusIndicator({ status, className }: { status: PresenceStatus; className?: string }) {
  const colors: Record<PresenceStatus, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-400",
    offline: "bg-gray-400",
  }

  return (
    <span
      className={cn(
        "h-3 w-3 rounded-full border-2 border-background",
        colors[status],
        className || "absolute bottom-0 right-0"
      )}
    />
  )
}

function RoleIcon({ role }: { role: MemberWithPresence["role"] }) {
  if (role === "admin") {
    return <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
  }
  if (role === "moderator") {
    return <Shield className="h-3 w-3 text-purple-500 shrink-0" />
  }
  return null
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  variant?: "default" | "destructive"
}

function QuickActionButton({ icon: Icon, label, onClick, variant = "default" }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors text-left",
        variant === "destructive" && "text-destructive hover:bg-destructive/10"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export default InspectorPanel
