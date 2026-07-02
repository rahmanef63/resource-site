/**
 * Communications Schema
 * Unified schema for all communication features: channels, DMs, calls, screen sharing, AI bots
 * 
 * Architecture:
 * - Channels: Text/Voice/Video channels (like Discord/Slack)
 * - Threads: Threaded conversations within channels
 * - Direct Messages: 1-1 or small group DMs
 * - Calls: Audio/Video calls with screen sharing
 * - Roles: Channel-specific permissions
 * - AI Bots: AI assistants that can be added to channels/rooms
 * 
 * @module features/communications
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// CHANNEL CATEGORIES
// =============================================================================

/**
 * Channel categories for organizing channels (like Discord)
 */
export const channelCategories = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  position: v.number(),
  isCollapsed: v.optional(v.boolean()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_position", ["workspaceId", "position"]);

// =============================================================================
// CHANNELS
// =============================================================================

/**
 * Communication channels - supports text, voice, video, announcements, forums
 */
export const channels = defineTable({
  workspaceId: v.id("workspaces"),
  categoryId: v.optional(v.id("channelCategories")),
  
  // Basic info
  name: v.string(),
  slug: v.optional(v.string()), // URL-Contactly name
  description: v.optional(v.string()),
  topic: v.optional(v.string()), // Current topic/status
  icon: v.optional(v.string()), // Emoji or icon
  avatar: v.optional(v.string()), // Channel avatar/image
  
  // Channel type
  type: v.union(
    v.literal("text"),           // Regular text channel
    v.literal("voice"),          // Voice channel (persistent)
    v.literal("video"),          // Video room
    v.literal("announcement"),   // Read-only for most users
    v.literal("forum"),          // Forum-style with threads
    v.literal("stage"),          // Stage channel for events
    v.literal("huddle")          // Quick audio huddle
  ),
  
  // Visibility & Access
  isPrivate: v.boolean(),
  isArchived: v.optional(v.boolean()),
  isNsfw: v.optional(v.boolean()),
  
  // Ordering
  position: v.number(),
  
  // Settings
  settings: v.optional(v.object({
    // Message settings
    slowMode: v.optional(v.number()), // Seconds between messages
    autoArchiveThreads: v.optional(v.number()), // Days
    defaultThreadAutoArchive: v.optional(v.number()),
    
    // Voice/Video settings
    bitrate: v.optional(v.number()),
    userLimit: v.optional(v.number()), // Max users in voice/video
    videoQuality: v.optional(v.union(v.literal("auto"), v.literal("720p"), v.literal("1080p"))),
    
    // Permissions overrides
    defaultPermissions: v.optional(v.string()), // JSON-encoded default perms
    
    // AI settings
    aiEnabled: v.optional(v.boolean()),
    aiAutoRespond: v.optional(v.boolean()),
    aiModel: v.optional(v.string()),
  })),
  
  // Metadata
  lastActivityAt: v.optional(v.number()),
  messageCount: v.optional(v.number()),
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_category", ["categoryId"])
  .index("by_workspace_type", ["workspaceId", "type"])
  .index("by_workspace_position", ["workspaceId", "position"])
  .index("by_slug", ["workspaceId", "slug"])
  .searchIndex("search_channels", {
    searchField: "name",
    filterFields: ["workspaceId", "type", "isPrivate"],
  });

// =============================================================================
// CHANNEL ROLES & PERMISSIONS
// =============================================================================

/**
 * Channel-specific roles (like Discord roles)
 */
export const channelRoles = defineTable({
  channelId: v.id("channels"),
  workspaceId: v.id("workspaces"),
  
  // Role info
  name: v.string(),
  color: v.optional(v.string()), // Hex color for display
  icon: v.optional(v.string()),
  
  // Hierarchy (higher = more power)
  position: v.number(),
  
  // Is this the default role for new members?
  isDefault: v.optional(v.boolean()),
  
  // Permissions bitmask or object
  permissions: v.object({
    // General
    viewChannel: v.boolean(),
    manageChannel: v.boolean(),
    manageRoles: v.boolean(),
    
    // Messages
    sendMessages: v.boolean(),
    sendInThreads: v.optional(v.boolean()),
    createThreads: v.optional(v.boolean()),
    embedLinks: v.optional(v.boolean()),
    attachFiles: v.optional(v.boolean()),
    addReactions: v.optional(v.boolean()),
    useExternalEmoji: v.optional(v.boolean()),
    mentionEveryone: v.optional(v.boolean()),
    manageMessages: v.optional(v.boolean()), // Delete/pin others' messages
    
    // Voice/Video
    connect: v.optional(v.boolean()),
    speak: v.optional(v.boolean()),
    video: v.optional(v.boolean()),
    shareScreen: v.optional(v.boolean()),
    muteMembers: v.optional(v.boolean()),
    deafenMembers: v.optional(v.boolean()),
    moveMembers: v.optional(v.boolean()),
    
    // Members
    inviteMembers: v.optional(v.boolean()),
    kickMembers: v.optional(v.boolean()),
    banMembers: v.optional(v.boolean()),
    
    // AI
    useAi: v.optional(v.boolean()),
    manageAi: v.optional(v.boolean()),
  }),
  
  createdAt: v.number(),
})
  .index("by_channel", ["channelId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_channel_position", ["channelId", "position"]);

/**
 * Channel members with their roles
 */
export const channelMembers = defineTable({
  channelId: v.id("channels"),
  userId: v.id("users"),
  
  // Role assignments
  roleIds: v.array(v.id("channelRoles")),
  
  // Member-specific settings
  nickname: v.optional(v.string()),
  isMuted: v.optional(v.boolean()),
  
  // Notification settings
  notificationLevel: v.optional(v.union(
    v.literal("all"),
    v.literal("mentions"),
    v.literal("none")
  )),
  
  // Status
  lastReadMessageId: v.optional(v.id("channelMessages")),
  lastReadAt: v.optional(v.number()),
  joinedAt: v.number(),
  invitedBy: v.optional(v.id("users")),
})
  .index("by_channel", ["channelId"])
  .index("by_user", ["userId"])
  .index("by_channel_user", ["channelId", "userId"]);

// =============================================================================
// CHANNEL MESSAGES
// =============================================================================

/**
 * Messages in channels (unified for text, threads, etc.)
 */
export const channelMessages = defineTable({
  channelId: v.id("channels"),
  threadId: v.optional(v.id("channelThreads")), // If in a thread
  
  // Sender (user or AI bot)
  senderId: v.id("users"),
  senderType: v.union(v.literal("user"), v.literal("ai"), v.literal("system")),
  
  // Content
  content: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("video"),
    v.literal("audio"),
    v.literal("file"),
    v.literal("embed"),
    v.literal("system"),    // Join/leave messages
    v.literal("call"),      // Call started/ended
    v.literal("ai")         // AI response
  ),
  
  // Reply/Forward
  replyToId: v.optional(v.id("channelMessages")),
  forwardedFrom: v.optional(v.object({
    channelId: v.id("channels"),
    messageId: v.id("channelMessages"),
  })),
  
  // Status
  isPinned: v.optional(v.boolean()),
  isEdited: v.optional(v.boolean()),
  editedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  
  // Attachments & Media
  attachments: v.optional(v.array(v.object({
    id: v.string(),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file")),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()), // For audio/video
  }))),
  
  // Embeds (link previews, rich content)
  embeds: v.optional(v.array(v.object({
    type: v.string(),
    url: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    color: v.optional(v.string()),
  }))),
  
  // Mentions
  mentions: v.optional(v.object({
    users: v.optional(v.array(v.id("users"))),
    roles: v.optional(v.array(v.id("channelRoles"))),
    channels: v.optional(v.array(v.id("channels"))),
    everyone: v.optional(v.boolean()),
    here: v.optional(v.boolean()), // Online users only
  })),
  
  // AI-specific metadata
  aiMetadata: v.optional(v.object({
    model: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    isStreaming: v.optional(v.boolean()),
  })),
  
  // Timestamps
  createdAt: v.number(),
})
  .index("by_channel", ["channelId"])
  .index("by_channel_time", ["channelId", "createdAt"])
  .index("by_thread", ["threadId"])
  .index("by_sender", ["senderId"])
  .index("by_type", ["channelId", "type"])
  .searchIndex("search_messages", {
    searchField: "content",
    filterFields: ["channelId", "type", "senderId"],
  });

/**
 * Message reactions
 */
export const channelMessageReactions = defineTable({
  messageId: v.id("channelMessages"),
  userId: v.id("users"),
  emoji: v.string(), // Unicode emoji or custom emoji ID
  createdAt: v.number(),
})
  .index("by_message", ["messageId"])
  .index("by_user", ["userId"])
  .index("by_message_emoji", ["messageId", "emoji"]);

// =============================================================================
// THREADS
// =============================================================================

/**
 * Threads within channels
 */
export const channelThreads = defineTable({
  channelId: v.id("channels"),
  parentMessageId: v.id("channelMessages"), // Message that started the thread
  
  name: v.optional(v.string()),
  
  // Status
  isArchived: v.optional(v.boolean()),
  isLocked: v.optional(v.boolean()), // No new messages
  
  // Timestamps
  lastMessageAt: v.optional(v.number()),
  autoArchiveAt: v.optional(v.number()),
  createdAt: v.number(),
  
  // Stats
  messageCount: v.optional(v.number()),
  memberCount: v.optional(v.number()),
})
  .index("by_channel", ["channelId"])
  .index("by_parent_message", ["parentMessageId"]);

// =============================================================================
// CALLS (VIDEO/AUDIO/SCREEN SHARE)
// =============================================================================

/**
 * Calls - supports voice, video, screen sharing
 */
export const calls = defineTable({
  // Where the call is happening
  channelId: v.optional(v.id("channels")), // For channel-based calls
  workspaceId: v.id("workspaces"),
  
  // Call type
  type: v.union(
    v.literal("audio"),      // Voice only
    v.literal("video"),      // Video call
    v.literal("huddle"),     // Quick audio huddle
    v.literal("meeting"),    // Scheduled meeting
    v.literal("webinar")     // One-to-many broadcast
  ),
  
  // Status
  status: v.union(
    v.literal("scheduled"),
    v.literal("starting"),
    v.literal("active"),
    v.literal("ended"),
    v.literal("cancelled")
  ),
  
  // Initiator
  initiatorId: v.id("users"),
  
  // Scheduling
  scheduledAt: v.optional(v.number()),
  scheduledDuration: v.optional(v.number()), // Minutes
  
  // Actual times
  startedAt: v.optional(v.number()),
  endedAt: v.optional(v.number()),
  
  // Settings
  settings: v.optional(v.object({
    // Access
    isPrivate: v.optional(v.boolean()),
    password: v.optional(v.string()),
    waitingRoom: v.optional(v.boolean()),
    
    // Permissions
    allowScreenShare: v.optional(v.boolean()),
    allowRecording: v.optional(v.boolean()),
    allowChat: v.optional(v.boolean()),
    
    // Limits
    maxParticipants: v.optional(v.number()),
    
    // Recording
    autoRecord: v.optional(v.boolean()),
    
    // AI features
    aiNotetaker: v.optional(v.boolean()),
    aiTranscription: v.optional(v.boolean()),
    aiSummary: v.optional(v.boolean()),
  })),
  
  // Meeting info
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  
  // External integration (if using Twilio, Daily, etc.)
  externalRoomId: v.optional(v.string()),
  externalProvider: v.optional(v.string()),
  
  // Metadata
  metadata: v.optional(v.object({
    recordingUrl: v.optional(v.string()),
    transcriptUrl: v.optional(v.string()),
    summaryUrl: v.optional(v.string()),
    quality: v.optional(v.string()),
    endReason: v.optional(v.string()),
  })),
  
  createdAt: v.number(),
})
  .index("by_channel", ["channelId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_initiator", ["initiatorId"])
  .index("by_status", ["status"])
  .index("by_scheduled", ["scheduledAt"]);

/**
 * Call participants
 */
export const callParticipants = defineTable({
  callId: v.id("calls"),
  userId: v.id("users"),
  
  // Status
  status: v.union(
    v.literal("invited"),
    v.literal("waiting"),    // In waiting room
    v.literal("joining"),
    v.literal("connected"),
    v.literal("reconnecting"),
    v.literal("left"),
    v.literal("kicked"),
    v.literal("declined")
  ),
  
  // Media state
  isMuted: v.boolean(),
  isDeafened: v.optional(v.boolean()),
  isVideoOn: v.boolean(),
  isScreenSharing: v.boolean(),
  
  // Role in call
  role: v.union(
    v.literal("host"),
    v.literal("co-host"),
    v.literal("speaker"),    // Can speak in webinar
    v.literal("participant"),
    v.literal("viewer")      // View-only in webinar
  ),
  
  // Device info
  deviceInfo: v.optional(v.object({
    browser: v.optional(v.string()),
    os: v.optional(v.string()),
    device: v.optional(v.string()),
  })),
  
  // Timestamps
  joinedAt: v.optional(v.number()),
  leftAt: v.optional(v.number()),
  invitedAt: v.optional(v.number()),
  
  // Stats
  talkTime: v.optional(v.number()), // Seconds
})
  .index("by_call", ["callId"])
  .index("by_user", ["userId"])
  .index("by_call_user", ["callId", "userId"])
  .index("by_call_status", ["callId", "status"]);

/**
 * Screen share sessions within a call
 */
export const screenShares = defineTable({
  callId: v.id("calls"),
  userId: v.id("users"),
  
  // What's being shared
  shareType: v.union(
    v.literal("screen"),     // Entire screen
    v.literal("window"),     // Specific window
    v.literal("tab"),        // Browser tab
    v.literal("whiteboard")  // Collaborative whiteboard
  ),
  
  // Status
  isActive: v.boolean(),
  
  // Quality
  quality: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  withAudio: v.optional(v.boolean()),
  
  // Timestamps
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
})
  .index("by_call", ["callId"])
  .index("by_user", ["userId"])
  .index("by_call_active", ["callId", "isActive"]);

// =============================================================================
// AI BOTS
// =============================================================================

/**
 * AI Bots that can be added to channels/rooms
 */
export const aiBots = defineTable({
  workspaceId: v.id("workspaces"),
  
  // Bot identity
  name: v.string(),
  displayName: v.string(),
  avatar: v.optional(v.string()),
  description: v.optional(v.string()),
  
  // Bot type
  type: v.union(
    v.literal("assistant"),   // General AI assistant
    v.literal("moderator"),   // Moderation bot
    v.literal("notetaker"),   // Meeting notes
    v.literal("translator"),  // Real-time translation
    v.literal("custom")       // Custom bot
  ),
  
  // AI Configuration
  aiConfig: v.object({
    provider: v.string(), // "openai", "anthropic", "google", etc.
    model: v.string(),
    systemPrompt: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    
    // Capabilities
    canReadMessages: v.optional(v.boolean()),
    canSendMessages: v.optional(v.boolean()),
    canJoinCalls: v.optional(v.boolean()),
    canTranscribe: v.optional(v.boolean()),
    canSummarize: v.optional(v.boolean()),
    
    // Triggers
    triggerOnMention: v.optional(v.boolean()),
    triggerOnKeyword: v.optional(v.array(v.string())),
    autoRespond: v.optional(v.boolean()),
  }),
  
  // Status
  isActive: v.boolean(),
  isPublic: v.optional(v.boolean()), // Can be added by anyone
  
  // Creator
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_type", ["workspaceId", "type"])
  .index("by_creator", ["createdBy"]);

/**
 * AI Bot assignments to channels
 */
export const channelBots = defineTable({
  channelId: v.id("channels"),
  botId: v.id("aiBots"),
  
  // Settings for this specific channel
  settings: v.optional(v.object({
    autoRespond: v.optional(v.boolean()),
    respondToThreads: v.optional(v.boolean()),
    customPrompt: v.optional(v.string()),
  })),
  
  addedBy: v.id("users"),
  addedAt: v.number(),
})
  .index("by_channel", ["channelId"])
  .index("by_bot", ["botId"])
  .index("by_channel_bot", ["channelId", "botId"]);

// =============================================================================
// DIRECT MESSAGES (DMs)
// =============================================================================

/**
 * Direct message conversations (1-1 or small groups)
 */
export const directConversations = defineTable({
  workspaceId: v.optional(v.id("workspaces")), // Optional for global DMs
  
  // Type
  type: v.union(
    v.literal("direct"),     // 1-1 DM
    v.literal("group")       // Group DM (no channel features)
  ),
  
  // For group DMs
  name: v.optional(v.string()),
  icon: v.optional(v.string()),
  
  // Participants (stored for quick lookup)
  participantIds: v.array(v.id("users")),
  
  // Status
  lastMessageAt: v.optional(v.number()),
  
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_creator", ["createdBy"])
  .index("by_participants", ["participantIds"]);

/**
 * Direct message members with settings
 */
export const directMembers = defineTable({
  conversationId: v.id("directConversations"),
  userId: v.id("users"),
  
  // Settings
  isMuted: v.optional(v.boolean()),
  isPinned: v.optional(v.boolean()),
  isArchived: v.optional(v.boolean()),
  
  // Read status
  lastReadMessageId: v.optional(v.id("directMessages")),
  lastReadAt: v.optional(v.number()),
  
  joinedAt: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_user", ["userId"])
  .index("by_user_conversation", ["userId", "conversationId"]);

/**
 * Direct messages
 */
export const directMessages = defineTable({
  conversationId: v.id("directConversations"),
  senderId: v.id("users"),
  senderType: v.union(v.literal("user"), v.literal("ai")),
  
  content: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("video"),
    v.literal("audio"),
    v.literal("file"),
    v.literal("call"),
    v.literal("ai")
  ),
  
  replyToId: v.optional(v.id("directMessages")),
  
  // Status
  isEdited: v.optional(v.boolean()),
  editedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  
  // Attachments
  attachments: v.optional(v.array(v.object({
    id: v.string(),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file")),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    name: v.string(),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  }))),
  
  createdAt: v.number(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_conversation_time", ["conversationId", "createdAt"])
  .index("by_sender", ["senderId"])
  .searchIndex("search_dm", {
    searchField: "content",
    filterFields: ["conversationId"],
  });

// =============================================================================
// PRESENCE & ACTIVITY
// =============================================================================

/**
 * User presence in channels/calls
 */
export const userPresence = defineTable({
  userId: v.id("users"),
  workspaceId: v.optional(v.id("workspaces")),
  
  // Status
  status: v.union(
    v.literal("online"),
    v.literal("idle"),
    v.literal("dnd"),        // Do not disturb
    v.literal("invisible"),
    v.literal("offline")
  ),
  
  // Custom status
  customStatus: v.optional(v.object({
    emoji: v.optional(v.string()),
    text: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  })),
  
  // Current activity
  activity: v.optional(v.object({
    type: v.union(
      v.literal("viewing"),
      v.literal("typing"),
      v.literal("in_call"),
      v.literal("screen_sharing"),
      v.literal("idle")
    ),
    channelId: v.optional(v.id("channels")),
    callId: v.optional(v.id("calls")),
    startedAt: v.optional(v.number()),
  })),
  
  // Device info
  activeDevices: v.optional(v.array(v.object({
    id: v.string(),
    type: v.union(v.literal("desktop"), v.literal("mobile"), v.literal("web")),
    lastActiveAt: v.number(),
  }))),
  
  lastActiveAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"]);

/**
 * Typing indicators
 */
export const typingIndicators = defineTable({
  userId: v.id("users"),
  channelId: v.optional(v.id("channels")),
  conversationId: v.optional(v.id("directConversations")),
  threadId: v.optional(v.id("channelThreads")),
  startedAt: v.number(),
  expiresAt: v.number(), // Auto-cleanup after ~10 seconds
})
  .index("by_channel", ["channelId"])
  .index("by_conversation", ["conversationId"])
  .index("by_thread", ["threadId"])
  .index("by_expires", ["expiresAt"]);

// =============================================================================
// EXPORTS
// =============================================================================

export const communicationsTables = {
  // Categories
  channelCategories,
  
  // Channels
  channels,
  channelRoles,
  channelMembers,
  channelMessages,
  channelMessageReactions,
  channelThreads,
  
  // Calls
  calls,
  callParticipants,
  screenShares,
  
  // AI
  aiBots,
  channelBots,
  
  // DMs
  directConversations,
  directMembers,
  directMessages,
  
  // Presence
  userPresence,
  typingIndicators,
};
