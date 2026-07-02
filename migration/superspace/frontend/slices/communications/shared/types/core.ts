/**
 * Communications Types - Core type definitions
 * 
 * Unified types for channels, messages, calls, roles, and AI bots
 * 
 * @module features/communications/types
 */

import type { Id } from "@/convex/_generated/dataModel"

// =============================================================================
// CHANNELS
// =============================================================================

export type ChannelType =
  | "text"
  | "voice"
  | "video"
  | "announcement"
  | "forum"
  | "stage"
  | "huddle"

export interface ChannelCategory {
  id: string
  workspaceId: string
  name: string
  position: number
  isCollapsed?: boolean
  channels?: Channel[]
}

export interface Channel {
  id: string
  workspaceId: string
  categoryId?: string

  // Basic info
  name: string
  slug?: string
  description?: string
  topic?: string
  icon?: string
  avatar?: string

  // Type & visibility
  type: ChannelType
  isPrivate: boolean
  isArchived?: boolean
  isNsfw?: boolean

  // Ordering
  position: number

  // Settings
  settings?: ChannelSettings

  // User's relationship to this channel
  userMembership?: ChannelMembership
  userPermissions?: ChannelPermissions

  // Stats
  unreadCount?: number
  mentionCount?: number
  hasUnread?: boolean // Quick flag for unread indicator
  lastActivityAt?: string
  messageCount?: number
  memberCount?: number

  // Current call (for voice/video channels)
  activeCall?: CallSummary

  // AI
  aiEnabled?: boolean
  activeBots?: AIBotSummary[]
}

export interface ChannelSettings {
  slowMode?: number
  autoArchiveThreads?: number
  defaultThreadAutoArchive?: number
  bitrate?: number
  userLimit?: number
  videoQuality?: "auto" | "720p" | "1080p"
  aiEnabled?: boolean
  aiAutoRespond?: boolean
  aiModel?: string
}

// =============================================================================
// ROLES & PERMISSIONS
// =============================================================================

export interface ChannelRole {
  id: string
  channelId: string
  workspaceId: string

  name: string
  color?: string
  icon?: string
  position: number
  isDefault?: boolean

  permissions: ChannelPermissions
}

export interface ChannelPermissions {
  // General
  viewChannel: boolean
  manageChannel: boolean
  manageRoles: boolean

  // Messages
  sendMessages: boolean
  sendInThreads?: boolean
  createThreads?: boolean
  embedLinks?: boolean
  attachFiles?: boolean
  addReactions?: boolean
  useExternalEmoji?: boolean
  mentionEveryone?: boolean
  manageMessages?: boolean

  // Voice/Video
  connect?: boolean
  speak?: boolean
  video?: boolean
  shareScreen?: boolean
  muteMembers?: boolean
  deafenMembers?: boolean
  moveMembers?: boolean

  // Members
  inviteMembers?: boolean
  kickMembers?: boolean
  banMembers?: boolean

  // AI
  useAi?: boolean
  manageAi?: boolean
}

export interface ChannelMembership {
  channelId: string
  userId: string
  roleIds: string[]
  roles: ChannelRole[]
  nickname?: string
  isMuted?: boolean
  notificationLevel?: "all" | "mentions" | "none"
  lastReadMessageId?: string
  lastReadAt?: string
  joinedAt: string
}

// Default permissions for different role types
export const DEFAULT_PERMISSIONS: Record<string, Partial<ChannelPermissions>> = {
  admin: {
    viewChannel: true,
    manageChannel: true,
    manageRoles: true,
    sendMessages: true,
    sendInThreads: true,
    createThreads: true,
    embedLinks: true,
    attachFiles: true,
    addReactions: true,
    useExternalEmoji: true,
    mentionEveryone: true,
    manageMessages: true,
    connect: true,
    speak: true,
    video: true,
    shareScreen: true,
    muteMembers: true,
    deafenMembers: true,
    moveMembers: true,
    inviteMembers: true,
    kickMembers: true,
    banMembers: true,
    useAi: true,
    manageAi: true,
  },
  moderator: {
    viewChannel: true,
    manageChannel: false,
    manageRoles: false,
    sendMessages: true,
    sendInThreads: true,
    createThreads: true,
    embedLinks: true,
    attachFiles: true,
    addReactions: true,
    useExternalEmoji: true,
    mentionEveryone: true,
    manageMessages: true,
    connect: true,
    speak: true,
    video: true,
    shareScreen: true,
    muteMembers: true,
    deafenMembers: false,
    moveMembers: false,
    inviteMembers: true,
    kickMembers: true,
    banMembers: false,
    useAi: true,
    manageAi: false,
  },
  member: {
    viewChannel: true,
    manageChannel: false,
    manageRoles: false,
    sendMessages: true,
    sendInThreads: true,
    createThreads: true,
    embedLinks: true,
    attachFiles: true,
    addReactions: true,
    useExternalEmoji: true,
    mentionEveryone: false,
    manageMessages: false,
    connect: true,
    speak: true,
    video: true,
    shareScreen: true,
    muteMembers: false,
    deafenMembers: false,
    moveMembers: false,
    inviteMembers: false,
    kickMembers: false,
    banMembers: false,
    useAi: true,
    manageAi: false,
  },
  viewer: {
    viewChannel: true,
    manageChannel: false,
    manageRoles: false,
    sendMessages: false,
    sendInThreads: false,
    createThreads: false,
    embedLinks: false,
    attachFiles: false,
    addReactions: true,
    useExternalEmoji: false,
    mentionEveryone: false,
    manageMessages: false,
    connect: true,
    speak: false,
    video: false,
    shareScreen: false,
    muteMembers: false,
    deafenMembers: false,
    moveMembers: false,
    inviteMembers: false,
    kickMembers: false,
    banMembers: false,
    useAi: false,
    manageAi: false,
  },
}

// =============================================================================
// MESSAGES
// =============================================================================

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "embed"
  | "system"
  | "call"
  | "ai"

export type SenderType = "user" | "ai" | "system"

export interface Message {
  id: string
  channelId: string
  threadId?: string

  // Sender
  senderId: string
  senderType: SenderType
  sender?: MessageSender

  // Content
  content: string
  type: MessageType

  // Reply/Forward
  replyToId?: string
  replyTo?: Message
  forwardedFrom?: {
    channelId: string
    messageId: string
    channelName?: string
  }

  // Status
  isPinned?: boolean
  isEdited?: boolean
  editedAt?: string
  isDeleted?: boolean
  deletedAt?: string

  // Attachments
  attachments?: MessageAttachment[]

  // Embeds
  embeds?: MessageEmbed[]

  // Mentions
  mentions?: MessageMentions

  // Reactions
  reactions?: MessageReaction[]

  // AI metadata
  aiMetadata?: AIMessageMetadata

  // Thread info (if this message starts a thread)
  threadCount?: number
  threadLastReplyAt?: string

  // Timestamps
  createdAt: string
  timestamp: string // Formatted for display
}

export interface MessageSender {
  id: string
  name: string
  avatar?: string
  isBot?: boolean
  botType?: AIBotType
}

export interface MessageAttachment {
  id: string
  type: "image" | "video" | "audio" | "file"
  url?: string
  storageId?: string
  name: string
  size?: number
  mimeType?: string
  width?: number
  height?: number
  duration?: number
}

export interface MessageEmbed {
  type: string
  url?: string
  title?: string
  description?: string
  image?: string
  color?: string
}

export interface MessageMentions {
  users?: string[]
  roles?: string[]
  channels?: string[]
  everyone?: boolean
  here?: boolean
}

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean // Current user
}

export interface AIMessageMetadata {
  model?: string
  promptTokens?: number
  completionTokens?: number
  isStreaming?: boolean
}

// =============================================================================
// THREADS
// =============================================================================

export interface Thread {
  id: string
  channelId: string
  parentMessageId: string
  parentMessage?: Message

  name?: string

  isArchived?: boolean
  isLocked?: boolean

  lastMessageAt?: string
  autoArchiveAt?: string
  createdAt: string

  messageCount?: number
  memberCount?: number

  // Unread status
  unreadCount?: number
  lastReadAt?: string
}

// =============================================================================
// CALLS (VIDEO/AUDIO/SCREEN SHARE)
// =============================================================================

export type CallType = "audio" | "video" | "huddle" | "meeting" | "webinar"

export type CallStatus =
  | "scheduled"
  | "starting"
  | "active"
  | "ended"
  | "cancelled"

export type ParticipantStatus =
  | "invited"
  | "waiting"
  | "joining"
  | "connected"
  | "reconnecting"
  | "left"
  | "kicked"
  | "declined"

export type ParticipantRole = "host" | "co-host" | "speaker" | "participant" | "viewer"

export interface Call {
  id: string
  channelId?: string
  workspaceId: string

  type: CallType
  status: CallStatus

  initiatorId: string
  initiator?: CallParticipant

  // Scheduling
  scheduledAt?: string
  scheduledDuration?: number

  // Times
  startedAt?: string
  endedAt?: string
  duration?: number

  // Settings
  settings?: CallSettings

  // Info
  title?: string
  description?: string

  // Participants
  participants?: CallParticipant[]
  participantCount?: number

  // Screen shares
  screenShares?: ScreenShare[]

  // Recordings
  recordingUrl?: string
  transcriptUrl?: string
  summaryUrl?: string
}

export interface CallSummary {
  id: string
  type: CallType
  status: CallStatus
  participantCount: number
  startedAt?: string
}

export interface CallSettings {
  isPrivate?: boolean
  password?: string
  waitingRoom?: boolean
  allowScreenShare?: boolean
  allowRecording?: boolean
  allowChat?: boolean
  maxParticipants?: number
  autoRecord?: boolean
  aiNotetaker?: boolean
  aiTranscription?: boolean
  aiSummary?: boolean
}

export interface CallParticipant {
  id: string
  callId: string
  userId: string
  user?: {
    id: string
    name: string
    avatar?: string
  }

  status: ParticipantStatus
  role: ParticipantRole

  // Media state
  isMuted: boolean
  isDeafened?: boolean
  isVideoOn: boolean
  isScreenSharing: boolean
  isSpeaking?: boolean

  // Times
  joinedAt?: string
  leftAt?: string
}

export interface ScreenShare {
  id: string
  callId: string
  userId: string
  user?: {
    id: string
    name: string
    avatar?: string
  }

  shareType: "screen" | "window" | "tab" | "whiteboard"
  isActive: boolean
  quality?: "low" | "medium" | "high"
  withAudio?: boolean

  startedAt: string
  endedAt?: string
}

// =============================================================================
// AI BOTS
// =============================================================================

export type AIBotType =
  | "assistant"
  | "moderator"
  | "notetaker"
  | "translator"
  | "custom"

export interface AIBot {
  id: string
  workspaceId: string

  name: string
  displayName: string
  avatar?: string
  description?: string

  type: AIBotType

  aiConfig: AIBotConfig

  isActive: boolean
  isPublic?: boolean

  createdBy: string
  createdAt: string
}

export interface AIBotSummary {
  id: string
  name: string
  displayName: string
  avatar?: string
  type: AIBotType
}

export interface AIBotConfig {
  provider: string
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number

  // Capabilities
  canReadMessages?: boolean
  canSendMessages?: boolean
  canJoinCalls?: boolean
  canTranscribe?: boolean
  canSummarize?: boolean

  // Triggers
  triggerOnMention?: boolean
  triggerOnKeyword?: string[]
  autoRespond?: boolean
}

export interface ChannelBot {
  channelId: string
  botId: string
  bot: AIBot

  settings?: {
    autoRespond?: boolean
    respondToThreads?: boolean
    customPrompt?: string
  }

  addedBy: string
  addedAt: string
}

// =============================================================================
// DIRECT MESSAGES
// =============================================================================

export type DirectConversationType = "direct" | "group"

export interface DirectConversation {
  id: string
  workspaceId?: string

  type: DirectConversationType
  name?: string
  icon?: string

  participants: DirectParticipant[]
  participantIds: string[]

  // Status
  lastMessage?: DirectMessage
  lastMessageAt?: string

  // User's settings
  isMuted?: boolean
  isPinned?: boolean
  isArchived?: boolean
  unreadCount?: number

  createdBy: string
  createdAt: string
}

export interface DirectParticipant {
  id: string
  conversationId: string
  userId: string
  user?: {
    id: string
    name: string
    avatar?: string
    status?: PresenceStatus
  }

  isMuted?: boolean
  isPinned?: boolean
  isArchived?: boolean

  lastReadAt?: string
  joinedAt: string
}

export interface DirectMessage {
  id: string
  conversationId: string

  senderId: string
  senderType: SenderType
  sender?: MessageSender

  content: string
  type: MessageType

  replyToId?: string
  replyTo?: DirectMessage

  isEdited?: boolean
  editedAt?: string
  isDeleted?: boolean
  deletedAt?: string

  attachments?: MessageAttachment[]

  createdAt: string
  timestamp: string
}

// =============================================================================
// PRESENCE & ACTIVITY
// =============================================================================

export type PresenceStatus = "online" | "idle" | "dnd" | "invisible" | "offline"

export type ActivityType = "viewing" | "typing" | "in_call" | "screen_sharing" | "idle"

export interface UserPresence {
  userId: string
  workspaceId?: string

  status: PresenceStatus

  customStatus?: {
    emoji?: string
    text?: string
    expiresAt?: string
  }

  activity?: {
    type: ActivityType
    channelId?: string
    callId?: string
    startedAt?: string
  }

  lastActiveAt: string
}

export interface TypingIndicator {
  userId: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  channelId?: string
  conversationId?: string
  threadId?: string
  startedAt: string
}

// =============================================================================
// UI TYPES (for components)
// =============================================================================

/** Unified item for channel/DM lists */
export interface CommunicationListItem {
  id: string
  type: "channel" | "direct" | "group-dm"

  name: string
  icon?: string
  avatar?: string

  // Channel-specific
  channelType?: ChannelType
  categoryId?: string

  // DM-specific
  participants?: Array<{
    id: string
    name: string
    avatar?: string
    status?: PresenceStatus
  }>

  // Status
  unreadCount?: number
  mentionCount?: number
  lastActivityAt?: string

  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean

  // Voice/Video
  hasActiveCall?: boolean
  callParticipantCount?: number
}

/** Context menu actions */
export type CommunicationAction =
  | "edit"
  | "rename"
  | "pin"
  | "unpin"
  | "mute"
  | "unmute"
  | "archive"
  | "unarchive"
  | "leave"
  | "delete"
  | "invite"
  | "settings"
  | "call"
  | "video-call"
  | "add-ai"
  | "manage-roles"
