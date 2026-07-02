/**
 * Message Area
 * 
 * Main message display and input area for channels and DMs.
 * Uses premium UI components with date separators and typing indicators.
 * Uses PanelRoot/PanelHeader/PanelBody/PanelFooter for consistent layout.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Hash, ArrowDown } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Layout Components
import { PanelRoot, PanelBody, PanelFooter } from "@/frontend/shared/ui/layout"

// Components
import { ChannelHeader } from "../components/ChannelHeader"
import { MessageItem } from "../components/MessageItem"
import { MessageComposer } from "../components/MessageComposerNew"

// Store
import {
  useCommunicationsStore,
  useSelectedChannel,
  useSelectedChannelId,
  useTypingIndicators,
  useRightPanelOpen,
  useSelectedDirectId,
  useDirectConversations as useDirectConversationsStore,
  type Message,
  type DirectMessage,
  type DirectConversation,
  type Channel,
} from "../shared"

// Hooks for backend mutations and queries
import {
  useDirectMessageMutations,
  useDirectConversations as useDirectConversationsQuery,
  useDirectMessages as useDirectMessagesQuery,
} from "../hooks/useDirectMessages"
import { useCommunicationWorkspace } from "../hooks/useCommunicationWorkspace"
import { useMessages } from "../hooks/useMessages"
import { useChannel, useChannels } from "../hooks/useChannels"
import { useCommunications } from "../hooks/useCommunications"

interface MessageAreaProps {
  type: "channel" | "direct"
  className?: string
}

export function MessageArea({ type, className }: MessageAreaProps) {
  // Backend mutations and workspace context
  const { sendMessage: sendDMMessage } = useDirectMessageMutations()
  const { activeWorkspaceId, activeWorkspaceIdString } = useCommunicationWorkspace()
  const { sendMessage: sendChannelMessage } = useCommunications(activeWorkspaceId)

  // Channel state - fetch from backend
  const selectedChannelId = useSelectedChannelId()
  const { channel: backendChannel, isLoading: channelLoading } = useChannel(selectedChannelId || undefined)
  const { messages: channelMessages, isLoading: channelMessagesLoading } = useMessages({
    channelId: selectedChannelId || undefined
  })

  // DM state - fetch from backend
  const selectedDirectId = useSelectedDirectId()
  const { conversations: backendConversations } = useDirectConversationsQuery({
    workspaceId: activeWorkspaceId ?? undefined
  })
  const { messages: backendDMMessages, isLoading: dmMessagesLoading } = useDirectMessagesQuery({
    conversationId: selectedDirectId || undefined
  })

  // Determine active selection based on type
  const selectedId = type === "channel" ? selectedChannelId : selectedDirectId
  const selectedItem = type === "channel"
    ? backendChannel
    : backendConversations.find(c => c.id === selectedDirectId) || null

  // Use backend messages for both channels and DMs
  const messages = (type === "channel" ? channelMessages : backendDMMessages) as Message[]

  const typingUsers = useTypingIndicators(selectedId || "")
  const rightPanelOpen = useRightPanelOpen()

  const setRightPanelContent = useCommunicationsStore(state => state.setRightPanelContent)
  const toggleRightPanel = useCommunicationsStore(state => state.toggleRightPanel)
  const setActiveCall = useCommunicationsStore(state => state.setActiveCall)
  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = React.useState(false)
  const [replyingTo, setReplyingTo] = React.useState<Message | null>(null)

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentGroup: { date: string; messages: Message[] } | null = null

    for (const message of messages) {
      const messageDate = new Date(message.createdAt).toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] }
        groups.push(currentGroup)
      }

      currentGroup.messages.push(message)
    }

    return groups
  }, [messages])

  // Check if consecutive messages should be grouped
  const shouldGroupMessage = (messages: Message[], index: number): boolean => {
    if (index === 0) return false
    const current = messages[index]
    const previous = messages[index - 1]

    if (current.senderId !== previous.senderId) return false

    const currentTime = new Date(current.createdAt).getTime()
    const previousTime = new Date(previous.createdAt).getTime()
    const diffMinutes = (currentTime - previousTime) / 60000

    return diffMinutes < 5
  }

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle scroll to show/hide jump button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setShowScrollButton(!isAtBottom)
  }

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Handle message send
  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedId) return

    try {
      if (type === "channel") {
        // For channels, use the channel message mutation
        await sendChannelMessage({
          conversationId: selectedId as any,
          content,
          type: "text",
          replyToId: replyingTo?.id as any,
        })
      } else {
        // For DMs, use the direct message mutation
        await sendDMMessage({
          conversationId: selectedId,
          content,
          type: "text",
          replyToId: replyingTo?.id,
        })
      }
      setReplyingTo(null)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Start a call
  const handleStartCall = (isVideo = false) => {
    if (!selectedItem) return
    const callWorkspaceId = activeWorkspaceIdString || selectedItem.workspaceId
    if (!callWorkspaceId) return

    // Generate call ID
    const callId = `call-${Date.now()}`

    setActiveCall({
      id: callId,
      channelId: selectedItem.id,
      workspaceId: callWorkspaceId,
      type: isVideo ? "video" : "audio",
      status: "active",
      initiatorId: "user-current",
      title: `${selectedItem.name} Call`,
      startedAt: new Date().toISOString(),
    })
    setViewMode("call")
  }

  if (!selectedItem) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="text-center">
          <Hash className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No {type === "channel" ? "Channel" : "Conversation"} Selected</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Select a {type === "channel" ? "channel" : "conversation"} from the sidebar to start chatting
          </p>
        </div>
      </div>
    )
  }

  return (
    <PanelRoot className={className}>
      {/* Header - Fixed at top */}
      <ChannelHeader
        channel={selectedItem as Channel}
        memberCount={0}
        pinnedCount={0}
        onMembersClick={() => {
          toggleRightPanel()
          setRightPanelContent("members")
        }}
        onStartCall={() => handleStartCall(false)}
        onStartVideoCall={() => handleStartCall(true)}
      />

      {/* Body - Scrollable messages */}
      <PanelBody scrollable={false} className="relative">
        <ScrollArea
          className="h-full"
          onScroll={handleScroll}
          ref={scrollContainerRef as any}
        >
          <div className="min-h-full flex flex-col justify-end">
            {/* Welcome message for empty channels */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-2xl mb-2">
                  Welcome to #{selectedItem.name}!
                </h3>
                <p className="text-muted-foreground max-w-md">
                  This is the start of the #{selectedItem.name} {type === "channel" ? "channel" : "conversation"}.
                  {(selectedItem as any).description && ` ${(selectedItem as any).description}`}
                </p>
              </div>
            ) : (
              <div className="py-4">
                {groupedMessages.map((group, groupIndex) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-4 px-4 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {group.date}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Messages */}
                    {group.messages.map((message, index) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isGrouped={shouldGroupMessage(group.messages, index)}
                        onReply={setReplyingTo}
                        onReact={(msg, emoji) => {
                          // Handle reaction - would update store
                        }}
                        onDelete={() => {
                          // Handle delete using mutation
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </PanelBody>

      {/* Footer - Input */}
      <PanelFooter>
        <MessageComposer
          onSend={handleSendMessage}
          onTyping={() => {
            // Send typing indicator
          }}
          placeholder={`Message #${selectedItem.name}`}
        />
      </PanelFooter>
    </PanelRoot>
  )
}

export default MessageArea
