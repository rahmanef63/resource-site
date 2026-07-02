/**
 * Member Panel
 * 
 * Right panel showing channel members with their roles and status.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Crown, Shield, Circle } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Store
import {
  useCommunicationsStore,
  useSelectedChannel,
  type ChannelMembership,
  type PresenceStatus,
} from "../shared"

interface MemberPanelProps {
  className?: string
}

export function MemberPanel({ className }: MemberPanelProps) {
  const selectedChannel = useSelectedChannel()
  const setRightPanelContent = useCommunicationsStore(state => state.setRightPanelContent)
  
  // Mock members - would come from useChannelMembers hook
  const members: MemberWithPresence[] = [
    { id: "1", name: "John Doe", avatar: undefined, role: "admin", status: "online" },
    { id: "2", name: "Jane Smith", avatar: undefined, role: "moderator", status: "online" },
    { id: "3", name: "Bob Wilson", avatar: undefined, role: "member", status: "idle" },
    { id: "4", name: "Alice Brown", avatar: undefined, role: "member", status: "dnd" },
    { id: "5", name: "Charlie Davis", avatar: undefined, role: "member", status: "offline" },
  ]
  
  // Group members by online status
  const { online, offline } = React.useMemo(() => {
    const online: MemberWithPresence[] = []
    const offline: MemberWithPresence[] = []
    
    for (const member of members) {
      if (member.status === "offline") {
        offline.push(member)
      } else {
        online.push(member)
      }
    }
    
    return { online, offline }
  }, [members])

  return (
    <div className={cn("flex flex-col h-full border-l", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h3 className="font-semibold text-sm">Members — {members.length}</h3>
        <Button aria-label="Close" 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setRightPanelContent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Member List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Online members */}
          {online.length > 0 && (
            <MemberSection 
              title={`Online — ${online.length}`}
              members={online}
            />
          )}
          
          {/* Offline members */}
          {offline.length > 0 && (
            <MemberSection 
              title={`Offline — ${offline.length}`}
              members={offline}
            />
          )}
        </div>
      </ScrollArea>
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

interface MemberSectionProps {
  title: string
  members: MemberWithPresence[]
}

function MemberSection({ title, members }: MemberSectionProps) {
  return (
    <div className="mb-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-2">
        {title}
      </h4>
      <div className="space-y-0.5">
        {members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}
      </div>
    </div>
  )
}

interface MemberItemProps {
  member: MemberWithPresence
}

function MemberItem({ member }: MemberItemProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded-md",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors text-left",
        member.status === "offline" && "opacity-50"
      )}
    >
      {/* Avatar with status */}
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.avatar} />
          <AvatarFallback className="text-xs">
            {member.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <StatusIndicator status={member.status} />
      </div>
      
      {/* Name and role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">
            {member.name}
          </span>
          <RoleIcon role={member.role} />
        </div>
      </div>
    </button>
  )
}

function StatusIndicator({ status }: { status: PresenceStatus }) {
  const colors: Record<PresenceStatus, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-400",
    offline: "bg-gray-400",
  }
  
  return (
    <span className={cn(
      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
      colors[status]
    )} />
  )
}

function RoleIcon({ role }: { role: MemberWithPresence["role"] }) {
  if (role === "admin") {
    return <Crown className="h-3 w-3 text-yellow-500" />
  }
  if (role === "moderator") {
    return <Shield className="h-3 w-3 text-purple-500" />
  }
  return null
}

export default MemberPanel
