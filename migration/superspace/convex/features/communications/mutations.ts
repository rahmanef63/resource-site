import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

/**
 * Mutations for communications feature
 * Manages channels, messages, and real-time communication
 */

// ============================================================================
// Channel Mutations
// ============================================================================

/**
 * Create a new channel
 */
export const createChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        type: v.optional(v.union(
            v.literal("text"),
            v.literal("voice"),
            v.literal("video"),
            v.literal("announcement"),
            v.literal("forum"),
            v.literal("stage"),
            v.literal("huddle")
        )),
        description: v.optional(v.string()),
        isPrivate: v.optional(v.boolean()),
        categoryId: v.optional(v.id("channelCategories")),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_MANAGE
        )

        const now = Date.now()

        // Generate slug from name
        const slug = args.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

        // Get position (last in workspace)
        const existingChannels = await ctx.db
            .query("channels")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .take(1000)

        const position = existingChannels.length

        const channelId = await ctx.db.insert("channels", {
            workspaceId: args.workspaceId,
            name: args.name,
            slug,
            description: args.description,
            type: args.type ?? "text",
            isPrivate: args.isPrivate ?? false,
            categoryId: args.categoryId,
            position,
            createdBy: membership.userId,
            createdAt: now,
            lastActivityAt: now,
            messageCount: 0,
        })

        // Add creator as member
        await ctx.db.insert("channelMembers", {
            channelId,
            userId: membership.userId,
            roleIds: [],
            joinedAt: now,
            notificationLevel: "all",
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.create",
            resourceType: "channel",
            resourceId: channelId,
            metadata: { name: args.name, type: args.type ?? "text" },
        })

        return { channelId, slug }
    },
})

/**
 * Update channel details
 */
export const updateChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.id("channels"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        topic: v.optional(v.string()),
        isPrivate: v.optional(v.boolean()),
        isArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_MANAGE
        )

        const channel = await ctx.db.get(args.channelId)
        if (!channel || channel.workspaceId !== args.workspaceId) {
            throw new Error("Channel not found")
        }

        const updates: any = {}
        if (args.name !== undefined) {
            updates.name = args.name
            updates.slug = args.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
        }
        if (args.description !== undefined) updates.description = args.description
        if (args.topic !== undefined) updates.topic = args.topic
        if (args.isPrivate !== undefined) updates.isPrivate = args.isPrivate
        if (args.isArchived !== undefined) updates.isArchived = args.isArchived

        await ctx.db.patch(args.channelId, updates)

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.update",
            resourceType: "channel",
            resourceId: args.channelId,
            metadata: { name: channel.name },
        })

        return { success: true }
    },
})

/**
 * Delete (archive) a channel
 */
export const deleteChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_MANAGE
        )

        const channel = await ctx.db.get(args.channelId)
        if (!channel || channel.workspaceId !== args.workspaceId) {
            throw new Error("Channel not found")
        }

        // Soft delete by archiving
        await ctx.db.patch(args.channelId, { isArchived: true })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.delete",
            resourceType: "channel",
            resourceId: args.channelId,
            metadata: { name: channel.name },
        })

        return { success: true }
    },
})

// ============================================================================
// Message Mutations
// ============================================================================

/**
 * Send a message to a channel
 */
export const sendMessage = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.id("channels"),
        content: v.string(),
        replyToId: v.optional(v.id("channelMessages")),
        attachments: v.optional(v.array(v.object({
            id: v.string(),
            type: v.string(),
            name: v.string(),
            url: v.string(),
            size: v.optional(v.number()),
        }))),
        mentions: v.optional(v.array(v.id("users"))),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const channel = await ctx.db.get(args.channelId)
        if (!channel || channel.workspaceId !== args.workspaceId) {
            throw new Error("Channel not found")
        }

        if (channel.isArchived) {
            throw new Error("Cannot send messages to archived channel")
        }

        const now = Date.now()

        // Check slow mode
        if (channel.settings?.slowMode) {
            const lastMessage = await ctx.db
                .query("channelMessages")
                .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
                .filter((q) => q.eq(q.field("senderId"), membership.userId))
                .order("desc")
                .first()

            if (lastMessage) {
                const timeSinceLastMessage = now - lastMessage.createdAt
                const slowModeMs = channel.settings.slowMode * 1000
                if (timeSinceLastMessage < slowModeMs) {
                    throw new Error(`Slow mode active. Wait ${Math.ceil((slowModeMs - timeSinceLastMessage) / 1000)} seconds`)
                }
            }
        }

        const messageId = await ctx.db.insert("channelMessages", {
            channelId: args.channelId,
            senderId: membership.userId,
            senderType: "user",
            content: args.content,
            type: "text",
            replyToId: args.replyToId,
            attachments: args.attachments?.map(att => ({
                id: att.id,
                type: att.type as "image" | "file" | "video" | "audio",
                name: att.name,
                url: att.url,
                size: att.size,
            })),
            mentions: args.mentions ? { users: args.mentions } : undefined,
            isPinned: false,
            isEdited: false,
            createdAt: now,
        })

        // Update channel last activity
        await ctx.db.patch(args.channelId, {
            lastActivityAt: now,
            messageCount: (channel.messageCount ?? 0) + 1,
        })

        // Create notifications for mentions
        if (args.mentions && args.mentions.length > 0) {
            for (const userId of args.mentions) {
                if (userId !== membership.userId) {
                    await ctx.db.insert("notifications", {
                        workspaceId: args.workspaceId,
                        userId,
                        type: "message",
                        title: "You were mentioned",
                        message: `${membership.userId} mentioned you in #${channel.name}`,
                        isRead: false,
                        createdBy: membership.userId,
                    })
                }
            }
        }

        // Skip audit for normal messages (too noisy), but we can log if needed
        // await logAuditEvent(ctx, { ... })

        return { messageId }
    },
})

/**
 * Edit a message
 */
export const editMessage = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        messageId: v.id("channelMessages"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const message = await ctx.db.get(args.messageId)
        if (!message) {
            throw new Error("Message not found")
        }

        // Only author can edit
        if (message.senderId !== membership.userId) {
            throw new Error("Can only edit your own messages")
        }

        const now = Date.now()

        await ctx.db.patch(args.messageId, {
            content: args.content,
            isEdited: true,
            editedAt: now,
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.message.edited",
            resourceType: "channelMessage",
            resourceId: String(args.messageId),
            metadata: { channelId: String(message.channelId) },
        })

        return { success: true }
    },
})

/**
 * Delete a message
 */
export const deleteMessage = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        messageId: v.id("channelMessages"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const message = await ctx.db.get(args.messageId)
        if (!message) {
            throw new Error("Message not found")
        }

        // Only author or admin can delete
        const channel = await ctx.db.get(message.channelId)
        const isAuthor = message.senderId === membership.userId

        if (!isAuthor) {
            // Check if user has manage permission
            await requirePermission(ctx, args.workspaceId, PERMS.COMMUNICATIONS_MANAGE)
        }

        await ctx.db.delete(args.messageId)

        // Update message count
        if (channel) {
            await ctx.db.patch(channel._id, {
                messageCount: Math.max(0, (channel.messageCount ?? 0) - 1),
            })
        }

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.message.deleted",
            resourceType: "channelMessage",
            resourceId: String(args.messageId),
            metadata: { channelId: String(message.channelId), byAuthor: isAuthor },
        })

        return { success: true }
    },
})

/**
 * Add reaction to a message
 */
// @dod:skip-audit reason="emoji reactions are high-frequency, low-signal interactions; reactions table IS the engagement record; auditing each emoji-toggle would inflate audit log without adding compliance value"
export const addReaction = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        messageId: v.id("channelMessages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const message = await ctx.db.get(args.messageId)
        if (!message) {
            throw new Error("Message not found")
        }

        const now = Date.now()

        // Check if reaction already exists
        const existingReaction = await ctx.db
            .query("channelMessageReactions")
            .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), membership.userId),
                    q.eq(q.field("emoji"), args.emoji)
                )
            )
            .first()

        if (existingReaction) {
            // Remove reaction (toggle)
            await ctx.db.delete(existingReaction._id)
            return { removed: true }
        }

        // Add reaction
        await ctx.db.insert("channelMessageReactions", {
            messageId: args.messageId,
            userId: membership.userId,
            emoji: args.emoji,
            createdAt: now,
        })

        return { added: true }
    },
})

// ============================================================================
// Channel Member Mutations
// ============================================================================

/**
 * Join a channel
 */
export const joinChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const channel = await ctx.db.get(args.channelId)
        if (!channel || channel.workspaceId !== args.workspaceId) {
            throw new Error("Channel not found")
        }

        if (channel.isPrivate) {
            throw new Error("Cannot join private channel without invitation")
        }

        // Check if already member
        const existingMember = await ctx.db
            .query("channelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", args.channelId).eq("userId", membership.userId)
            )
            .first()

        if (existingMember) {
            return { alreadyMember: true }
        }

        await ctx.db.insert("channelMembers", {
            channelId: args.channelId,
            userId: membership.userId,
            roleIds: [],
            joinedAt: Date.now(),
            notificationLevel: "all",
        })

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.joined",
            resourceType: "channel",
            resourceId: String(args.channelId),
            metadata: { channelName: channel.name },
        })

        return { success: true }
    },
})

/**
 * Leave a channel
 */
export const leaveChannel = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        channelId: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const { membership } = await requirePermission(
            ctx,
            args.workspaceId,
            PERMS.COMMUNICATIONS_VIEW
        )

        const member = await ctx.db
            .query("channelMembers")
            .withIndex("by_channel_user", (q) =>
                q.eq("channelId", args.channelId).eq("userId", membership.userId)
            )
            .first()

        if (!member) {
            throw new Error("Not a member of this channel")
        }

        await ctx.db.delete(member._id)

        await logAuditEvent(ctx, {
            workspaceId: args.workspaceId,
            actorUserId: membership.userId,
            action: "communications.channel.left",
            resourceType: "channel",
            resourceId: String(args.channelId),
        })

        return { success: true }
    },
})

// ============================================================================
// Presence Mutations
// ============================================================================

/**
 * Update user presence
 */
// @dod:skip-audit reason="presence (online/away/busy/offline) is high-frequency heartbeat telemetry; userPresence table IS the live state; auditing every status flip would dwarf the audit log"
export const updatePresence = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        status: v.union(
            v.literal("online"),
            v.literal("away"),
            v.literal("busy"),
            v.literal("offline")
        ),
        statusMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requirePermission(ctx, args.workspaceId, PERMS.COMMUNICATIONS_VIEW)
        const candidateIds = await resolveCandidateUserIds(ctx)
        if (candidateIds.length === 0) throw new Error("Not authenticated")

        const userId = candidateIds[0] as Id<"users">
        const now = Date.now()

        // Map status to schema values
        let schemaStatus: "online" | "idle" | "dnd" | "offline" = "online";
        if (args.status === "away") schemaStatus = "idle";
        else if (args.status === "busy") schemaStatus = "dnd";
        else if (args.status === "offline") schemaStatus = "offline";

        // Update or create presence
        const existingPresence = await ctx.db
            .query("userPresence")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("userId"), userId))
            .first()

        if (existingPresence) {
            await ctx.db.patch(existingPresence._id, {
                status: schemaStatus,
                customStatus: args.statusMessage ? { text: args.statusMessage } : undefined,
                lastActiveAt: now,
                updatedAt: now,
            })
        } else {
            await ctx.db.insert("userPresence", {
                workspaceId: args.workspaceId,
                userId,
                status: schemaStatus,
                customStatus: args.statusMessage ? { text: args.statusMessage } : undefined,
                lastActiveAt: now,
                updatedAt: now,
            })
        }

        return { success: true }
    },
})
