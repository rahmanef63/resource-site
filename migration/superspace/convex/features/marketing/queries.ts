import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Comprehensive Marketing Queries
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Main Data Query (for Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get marketing dashboard data
 * Returns data matching the MarketingData interface expected by the frontend
 */
export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get all campaigns for this workspace
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)

    // Get active campaigns
    const activeCampaigns = campaigns.filter(c => c.status === "active" || c.status === "scheduled")

    // Calculate stats
    const totalSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
    
    // Calculate spend (from budget if available)
    const totalSpend = campaigns.reduce((sum, c) => {
      if (c.budget?.spent) return sum + c.budget.spent
      return sum
    }, 0)

    // Calculate ROI (simple estimation based on conversions)
    const estimatedRevenue = totalConversions * 50 // Assume $50 per conversion
    const roi = totalSpend > 0 ? Number((estimatedRevenue / totalSpend).toFixed(1)) : 0

    // Calculate conversion rate
    const conversionRate = totalSent > 0 
      ? Number(((totalConversions / totalSent) * 100).toFixed(1)) 
      : 0

    // Format campaigns for frontend
    const formattedCampaigns = activeCampaigns.slice(0, 10).map(c => ({
      id: c._id,
      name: c.name,
      status: c.status as 'active' | 'scheduled' | 'ended' | 'draft',
      platform: (c.type === "email" ? "email" : 
               c.type === "social" ? "social" : 
               c.type === "ads" ? "display" : "email") as 'email' | 'social' | 'search' | 'display',
      budget: c.budget?.total || 0,
      impressions: (c.sent || 0) * 10, // Estimate impressions
      clicks: c.clicks || 0,
      conversions: c.conversions || 0,
    }))

    return {
      stats: {
        activeCampaigns: activeCampaigns.length,
        totalLeads: totalConversions,
        conversionRate,
        spend: totalSpend,
        roi,
      },
      activeCampaigns: formattedCampaigns,
      recentActivity: [], // TODO: Implement activity feed
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Campaign Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getCampaigns = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)

    // Filter by status
    if (args.status) {
      campaigns = campaigns.filter(c => c.status === args.status)
    }

    // Filter by type
    if (args.type) {
      campaigns = campaigns.filter(c => c.type === args.type)
    }

    // Apply limit
    if (args.limit) {
      campaigns = campaigns.slice(0, args.limit)
    }

    return campaigns
  },
})

export const getCampaign = query({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      return null
    }

    return campaign
  },
})

export const getCampaignStats = query({
  args: {
    workspaceId: v.id("workspaces"),
    campaignId: v.id("marketingCampaigns"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const campaign = await ctx.db.get(args.campaignId)
    if (!campaign || campaign.workspaceId !== args.workspaceId) {
      return null
    }

    // Get events for this campaign
    const events = await ctx.db
      .query("marketingEvents")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .take(1000)

    const sent = events.filter(e => e.type === "sent").length
    const delivered = events.filter(e => e.type === "delivered").length
    const opened = events.filter(e => e.type === "opened").length
    const clicked = events.filter(e => e.type === "clicked").length
    const bounced = events.filter(e => e.type === "bounced").length
    const unsubscribed = events.filter(e => e.type === "unsubscribed").length

    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : "0",
      clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : "0",
      bounceRate: sent > 0 ? ((bounced / sent) * 100).toFixed(1) : "0",
      unsubscribeRate: sent > 0 ? ((unsubscribed / sent) * 100).toFixed(1) : "0",
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Template Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getTemplates = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let templates = await ctx.db
      .query("marketingTemplates")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.type) {
      templates = templates.filter(t => t.type === args.type)
    }

    if (args.category) {
      templates = templates.filter(t => t.category === args.category)
    }

    // Sort by usage count (most used first)
    templates.sort((a, b) => b.usageCount - a.usageCount)

    return templates
  },
})

export const getTemplate = query({
  args: {
    workspaceId: v.id("workspaces"),
    templateId: v.id("marketingTemplates"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const template = await ctx.db.get(args.templateId)
    if (!template || template.workspaceId !== args.workspaceId) {
      return null
    }

    return template
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Subscriber Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getSubscribers = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    listId: v.optional(v.id("marketingLists")),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let subscribers = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Filter by status
    if (args.status) {
      subscribers = subscribers.filter(s => s.status === args.status)
    }

    // Filter by list
    if (args.listId) {
      subscribers = subscribers.filter(s => s.lists.includes(args.listId!))
    }

    // Search by email or name
    if (args.search) {
      const search = args.search.toLowerCase()
      subscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(search) ||
        s.firstName?.toLowerCase().includes(search) ||
        s.lastName?.toLowerCase().includes(search)
      )
    }

    const total = subscribers.length

    // Pagination
    const offset = args.offset || 0
    const limit = args.limit || 50
    subscribers = subscribers.slice(offset, offset + limit)

    return { subscribers, total }
  },
})

export const getSubscriber = query({
  args: {
    workspaceId: v.id("workspaces"),
    subscriberId: v.id("marketingSubscribers"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const subscriber = await ctx.db.get(args.subscriberId)
    if (!subscriber || subscriber.workspaceId !== args.workspaceId) {
      return null
    }

    return subscriber
  },
})

export const getSubscriberByEmail = query({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const subscriber = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_email", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("email", args.email)
      )
      .first()

    return subscriber
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// List Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getLists = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const lists = await ctx.db
      .query("marketingLists")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return lists
  },
})

export const getList = query({
  args: {
    workspaceId: v.id("workspaces"),
    listId: v.id("marketingLists"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const list = await ctx.db.get(args.listId)
    if (!list || list.workspaceId !== args.workspaceId) {
      return null
    }

    return list
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Segment Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getSegments = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const segments = await ctx.db
      .query("marketingSegments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    return segments
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Automation Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getAutomations = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let automations = await ctx.db
      .query("marketingAutomations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.status) {
      automations = automations.filter(a => a.status === args.status)
    }

    return automations
  },
})

export const getAutomation = query({
  args: {
    workspaceId: v.id("workspaces"),
    automationId: v.id("marketingAutomations"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const automation = await ctx.db.get(args.automationId)
    if (!automation || automation.workspaceId !== args.workspaceId) {
      return null
    }

    return automation
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Form Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getForms = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let forms = await ctx.db
      .query("marketingForms")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    if (args.type) {
      forms = forms.filter(f => f.type === args.type)
    }

    return forms
  },
})

export const getForm = query({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("marketingForms"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const form = await ctx.db.get(args.formId)
    if (!form || form.workspaceId !== args.workspaceId) {
      return null
    }

    return form
  },
})

export const getFormSubmissions = query({
  args: {
    workspaceId: v.id("workspaces"),
    formId: v.id("marketingForms"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let submissions = await ctx.db
      .query("marketingFormSubmissions")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .take(1000)

    submissions = submissions.filter(s => s.workspaceId === args.workspaceId)

    if (args.limit) {
      submissions = submissions.slice(0, args.limit)
    }

    return submissions
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Social Posts Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getSocialPosts = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    let posts = await ctx.db
      .query("marketingSocialPosts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(1000)

    if (args.status) {
      posts = posts.filter(p => p.status === args.status)
    }

    if (args.limit) {
      posts = posts.slice(0, args.limit)
    }

    return posts
  },
})

// ═══════════════════════════════════════════════════════════════════════════════
// Stats Queries
// ═══════════════════════════════════════════════════════════════════════════════

export const getStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get campaign stats
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const activeCampaigns = campaigns.filter(c => c.status === "active").length
    const emailsSent = campaigns.reduce((sum, c) => sum + (c.sent || 0), 0)
    const totalOpens = campaigns.reduce((sum, c) => sum + (c.opens || 0), 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)

    // Get subscriber stats
    const subscribers = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    const totalSubscribers = subscribers.length
    const activeSubscribers = subscribers.filter(s => s.status === "subscribed").length

    // Calculate rates
    const openRate = emailsSent > 0 ? Math.round((totalOpens / emailsSent) * 100) : 0
    const clickRate = totalOpens > 0 ? Math.round((totalClicks / totalOpens) * 100) : 0

    // Get lists count
    const lists = await ctx.db
      .query("marketingLists")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)

    // Get automations count
    const automations = await ctx.db
      .query("marketingAutomations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000)
    const activeAutomations = automations.filter(a => a.status === "active").length

    return {
      // Campaigns
      totalCampaigns: campaigns.length,
      activeCampaigns,
      
      // Email metrics
      emailsSent,
      openRate,
      clickRate,
      conversions: totalConversions,
      
      // Subscribers
      subscribers: totalSubscribers,
      activeSubscribers,
      
      // Lists
      totalLists: lists.length,
      
      // Automations
      totalAutomations: automations.length,
      activeAutomations,
    }
  },
})

export const getDashboardMetrics = query({
  args: {
    workspaceId: v.id("workspaces"),
    period: v.optional(v.union(
      v.literal("7d"),
      v.literal("30d"),
      v.literal("90d")
    )),
  },
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    const period = args.period || "30d"
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000)

    // Get recent events
    const events = await ctx.db
      .query("marketingEvents")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .take(1000)

    // Group by day
    const dailyStats: Record<string, { sent: number; opened: number; clicked: number }> = {}
    
    for (const event of events) {
      const date = new Date(event.createdAt).toISOString().split("T")[0]
      if (!dailyStats[date]) {
        dailyStats[date] = { sent: 0, opened: 0, clicked: 0 }
      }
      
      if (event.type === "sent") dailyStats[date].sent++
      if (event.type === "opened") dailyStats[date].opened++
      if (event.type === "clicked") dailyStats[date].clicked++
    }

    // Get new subscribers in period
    const subscribers = await ctx.db
      .query("marketingSubscribers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.gte(q.field("subscribedAt"), startDate))
      .take(1000)

    const newSubscribers = subscribers.filter(s => s.status === "subscribed").length
    const unsubscribed = subscribers.filter(s => s.status === "unsubscribed").length

    return {
      period,
      dailyStats: Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      newSubscribers,
      unsubscribed,
      netGrowth: newSubscribers - unsubscribed,
    }
  },
})
