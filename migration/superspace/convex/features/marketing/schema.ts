/**
 * Marketing Feature Schema
 * Comprehensive marketing automation, campaigns, and analytics
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const marketingTables = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Campaigns (Email, Social, Ads)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Campaign type
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("social"),
      v.literal("ads"),
      v.literal("push"),
      v.literal("content"),
      v.literal("event"),
      v.literal("other")
    ),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    
    // Content
    content: v.optional(v.object({
      subject: v.optional(v.string()),
      previewText: v.optional(v.string()),
      body: v.optional(v.string()),
      htmlBody: v.optional(v.string()),
      template: v.optional(v.id("marketingTemplates")),
      attachments: v.optional(v.array(v.object({
        name: v.string(),
        url: v.string(),
        type: v.string(),
      }))),
    })),
    
    // Audience targeting
    audience: v.optional(v.object({
      segments: v.optional(v.array(v.id("marketingSegments"))),
      lists: v.optional(v.array(v.id("marketingLists"))),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      excludeSegments: v.optional(v.array(v.id("marketingSegments"))),
      estimatedSize: v.optional(v.number()),
    })),
    
    // Scheduling
    schedule: v.optional(v.object({
      sendAt: v.optional(v.number()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      timezone: v.optional(v.string()),
      frequency: v.optional(v.string()), // one-time, daily, weekly, etc.
      sendInTimezone: v.optional(v.boolean()), // Send in recipient's timezone
    })),
    
    // A/B Testing
    abTest: v.optional(v.object({
      enabled: v.boolean(),
      variants: v.array(v.object({
        id: v.string(),
        name: v.string(),
        weight: v.number(), // Percentage
        subject: v.optional(v.string()),
        content: v.optional(v.string()),
      })),
      winnerCriteria: v.optional(v.string()), // opens, clicks, conversions
      testDuration: v.optional(v.number()), // hours
      winnerId: v.optional(v.string()),
    })),
    
    // Budget (for ads)
    budget: v.optional(v.object({
      total: v.number(),
      daily: v.optional(v.number()),
      spent: v.number(),
      currency: v.string(),
    })),
    
    // Performance metrics
    metrics: v.optional(v.object({
      sent: v.number(),
      delivered: v.number(),
      opens: v.number(),
      uniqueOpens: v.number(),
      clicks: v.number(),
      uniqueClicks: v.number(),
      bounces: v.number(),
      unsubscribes: v.number(),
      complaints: v.number(),
      conversions: v.number(),
      revenue: v.optional(v.number()),
    })),
    
    // Rates (calculated)
    sent: v.optional(v.number()),
    delivered: v.optional(v.number()),
    opens: v.optional(v.number()),
    clicks: v.optional(v.number()),
    conversions: v.optional(v.number()),
    unsubscribes: v.optional(v.number()),
    bounces: v.optional(v.number()),
    
    // Goals
    goals: v.optional(v.array(v.object({
      type: v.string(), // opens, clicks, conversions, revenue
      target: v.number(),
      current: v.number(),
    }))),
    
    // Tags
    tags: v.optional(v.array(v.string())),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    sentAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_creator", ["createdBy"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Templates (Reusable email/content templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Template type
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("landing_page"),
      v.literal("social_post"),
      v.literal("push_notification")
    ),
    
    // Category
    category: v.optional(v.string()), // welcome, newsletter, promotional, etc.
    
    // Content
    subject: v.optional(v.string()), // For emails
    previewText: v.optional(v.string()),
    content: v.string(), // Plain text or JSON for builder
    htmlContent: v.optional(v.string()),
    
    // Template type
    format: v.union(
      v.literal("html"),
      v.literal("builder"), // Drag-drop builder JSON
      v.literal("text")
    ),
    
    // Variables/Merge tags
    variables: v.optional(v.array(v.object({
      name: v.string(),
      defaultValue: v.optional(v.string()),
      type: v.string(), // text, number, date, url
      required: v.boolean(),
    }))),
    
    // Preview
    thumbnail: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    
    // Sharing
    isPublic: v.boolean(),
    isDefault: v.optional(v.boolean()),
    
    // Usage tracking
    usageCount: v.number(),
    lastUsed: v.optional(v.number()),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_type", ["workspaceId", "type"])
    .index("by_category", ["workspaceId", "category"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Lists (Contact lists for campaigns)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingLists: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Type
    type: v.union(
      v.literal("static"), // Manually managed
      v.literal("dynamic") // Auto-updated based on rules
    ),
    
    // For dynamic lists
    rules: v.optional(v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
      logic: v.optional(v.string()), // AND, OR
    }))),
    
    // Stats
    subscriberCount: v.number(),
    activeCount: v.optional(v.number()),
    unsubscribedCount: v.optional(v.number()),
    
    // Double opt-in
    doubleOptIn: v.optional(v.boolean()),
    
    // Tags
    tags: v.optional(v.array(v.string())),
    
    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Subscribers (Contacts subscribed to marketing)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingSubscribers: defineTable({
    // Contact info
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    
    // Link to contacts table
    contactId: v.optional(v.id("contacts")),
    
    // Lists
    lists: v.array(v.id("marketingLists")),
    
    // Status
    status: v.union(
      v.literal("subscribed"),
      v.literal("unsubscribed"),
      v.literal("cleaned"), // Invalid email
      v.literal("pending") // Awaiting confirmation
    ),
    
    // Preferences
    preferences: v.optional(v.object({
      emailFrequency: v.optional(v.string()), // all, weekly, monthly
      categories: v.optional(v.array(v.string())), // newsletter, promotions, etc.
      timezone: v.optional(v.string()),
    })),
    
    // Engagement data
    engagement: v.optional(v.object({
      totalOpens: v.number(),
      totalClicks: v.number(),
      lastOpen: v.optional(v.number()),
      lastClick: v.optional(v.number()),
      emailsSent: v.number(),
    })),
    
    // Scoring
    score: v.optional(v.number()), // Engagement score
    
    // Custom fields
    customFields: v.optional(v.record(v.string(), v.any())),
    
    // Source
    source: v.optional(v.string()), // form, import, api, etc.
    sourceId: v.optional(v.string()),
    
    // Consent
    consentGiven: v.optional(v.boolean()),
    consentDate: v.optional(v.number()),
    consentSource: v.optional(v.string()),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    subscribedAt: v.number(),
    unsubscribedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["workspaceId", "email"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_contact", ["contactId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Segments (Advanced audience segments)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingSegments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Segment rules
    rules: v.array(v.object({
      type: v.string(), // property, behavior, event
      field: v.string(),
      operator: v.string(),
      value: v.any(),
      logic: v.optional(v.string()), // AND, OR
    })),
    
    // Stats
    size: v.number(),
    lastCalculated: v.optional(v.number()),
    
    // Auto-refresh
    autoRefresh: v.optional(v.boolean()),
    refreshInterval: v.optional(v.number()), // hours
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Automations (Workflow automations)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingAutomations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("archived")
    ),
    
    // Trigger
    trigger: v.object({
      type: v.string(), // subscriber_added, tag_added, form_submitted, etc.
      conditions: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      config: v.optional(v.record(v.string(), v.any())),
    }),
    
    // Workflow steps
    steps: v.array(v.object({
      id: v.string(),
      type: v.string(), // send_email, wait, condition, add_tag, etc.
      config: v.record(v.string(), v.any()),
      nextSteps: v.optional(v.array(v.object({
        stepId: v.string(),
        condition: v.optional(v.string()),
      }))),
    })),
    
    // Stats
    stats: v.optional(v.object({
      enrolled: v.number(),
      completed: v.number(),
      active: v.number(),
      emailsSent: v.number(),
    })),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["workspaceId", "status"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Forms (Lead capture forms)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingForms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    
    // Form type
    type: v.union(
      v.literal("embedded"),
      v.literal("popup"),
      v.literal("landing_page")
    ),
    
    // Fields
    fields: v.array(v.object({
      id: v.string(),
      type: v.string(), // text, email, phone, select, checkbox, etc.
      name: v.string(),
      label: v.string(),
      placeholder: v.optional(v.string()),
      required: v.boolean(),
      options: v.optional(v.array(v.object({
        label: v.string(),
        value: v.string(),
      }))),
      validation: v.optional(v.object({
        pattern: v.optional(v.string()),
        minLength: v.optional(v.number()),
        maxLength: v.optional(v.number()),
        message: v.optional(v.string()),
      })),
    })),
    
    // Settings
    settings: v.optional(v.object({
      submitButtonText: v.optional(v.string()),
      successMessage: v.optional(v.string()),
      redirectUrl: v.optional(v.string()),
      doubleOptIn: v.optional(v.boolean()),
      addToLists: v.optional(v.array(v.id("marketingLists"))),
      addTags: v.optional(v.array(v.string())),
      notifyEmail: v.optional(v.string()),
    })),
    
    // Styling
    style: v.optional(v.object({
      theme: v.optional(v.string()),
      primaryColor: v.optional(v.string()),
      backgroundColor: v.optional(v.string()),
      fontFamily: v.optional(v.string()),
      customCss: v.optional(v.string()),
    })),
    
    // Stats
    views: v.optional(v.number()),
    submissions: v.optional(v.number()),
    conversionRate: v.optional(v.number()),
    
    // Status
    isActive: v.boolean(),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Form Submissions
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingFormSubmissions: defineTable({
    formId: v.id("marketingForms"),
    
    // Submitted data
    data: v.record(v.string(), v.any()),
    
    // Contact created
    subscriberId: v.optional(v.id("marketingSubscribers")),
    contactId: v.optional(v.id("contacts")),
    
    // Source info
    source: v.optional(v.object({
      url: v.optional(v.string()),
      referrer: v.optional(v.string()),
      utmSource: v.optional(v.string()),
      utmMedium: v.optional(v.string()),
      utmCampaign: v.optional(v.string()),
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })),
    
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processed")
    ),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_form", ["formId"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Events (Track subscriber/campaign events)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingEvents: defineTable({
    // Event type
    type: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("bounced"),
      v.literal("unsubscribed"),
      v.literal("complained"),
      v.literal("converted")
    ),
    
    // References
    campaignId: v.optional(v.id("marketingCampaigns")),
    subscriberId: v.optional(v.id("marketingSubscribers")),
    email: v.optional(v.string()),
    
    // Event data
    data: v.optional(v.object({
      url: v.optional(v.string()), // For clicks
      bounceType: v.optional(v.string()), // hard, soft
      bounceReason: v.optional(v.string()),
      complaintType: v.optional(v.string()),
      conversionValue: v.optional(v.number()),
    })),
    
    // Source info
    source: v.optional(v.object({
      ip: v.optional(v.string()),
      userAgent: v.optional(v.string()),
      device: v.optional(v.string()),
      country: v.optional(v.string()),
    })),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_campaign", ["campaignId"])
    .index("by_subscriber", ["subscriberId"])
    .index("by_type", ["workspaceId", "type"]),

  // ═══════════════════════════════════════════════════════════════════════════════
  // Marketing Social Posts (Social media scheduling)
  // ═══════════════════════════════════════════════════════════════════════════════
  marketingSocialPosts: defineTable({
    // Content
    content: v.string(),
    mediaUrls: v.optional(v.array(v.string())),
    
    // Platforms
    platforms: v.array(v.object({
      platform: v.string(), // facebook, twitter, instagram, linkedin
      accountId: v.string(),
      status: v.string(), // draft, scheduled, published, failed
      publishedAt: v.optional(v.number()),
      postId: v.optional(v.string()), // Platform's post ID
      error: v.optional(v.string()),
    })),
    
    // Scheduling
    scheduledFor: v.optional(v.number()),
    
    // Stats
    stats: v.optional(v.object({
      likes: v.number(),
      shares: v.number(),
      comments: v.number(),
      reach: v.number(),
      impressions: v.number(),
    })),
    
    // Campaign link
    campaignId: v.optional(v.id("marketingCampaigns")),
    
    // Status
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    
    // Workspace
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["workspaceId", "status"])
    .index("by_campaign", ["campaignId"]),
};

export default marketingTables;
