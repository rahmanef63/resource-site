/**
 * CRM Module Schema
 * Defines database tables for customer relationship management
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Shared address validator used by multiple tables.
const address = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  state: v.optional(v.string()),
  country: v.string(),
  postalCode: v.string(),
});

export default defineSchema({
  // Contacts
  contacts: defineTable({
    // Basic information
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    mobile: v.optional(v.string()),

    // Personal details
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    company: v.optional(v.id("accounts")),
    jobTitle: v.optional(v.string()),
    industry: v.optional(v.string()),

    // Address
    address: address,

    // Social media
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),

    // CRM fields
    leadSource: v.optional(v.id("leadSources")),
    owner: v.id("users"),
    tags: v.array(v.string()),

    // Status and preferences
    isActive: v.boolean(),
    isOptOut: v.boolean(),
    isDoNotCall: v.boolean(),
    isKeyContact: v.boolean(),
    contactType: v.union(
      v.literal("primary"),
      v.literal("secondary"),
      v.literal("emergency"),
      v.literal("billing"),
      v.literal("technical")
    ),

    // Relationship
    reportsTo: v.optional(v.id("contacts")),
    relatedContacts: v.array(v.id("contacts")),

    // Communication preferences
    preferredContact: v.union(
      v.literal("email"),
      v.literal("phone"),
      v.literal("sms"),
      v.literal("whatsapp")
    ),
    emailConsent: v.boolean(),
    smsConsent: v.boolean(),
    marketingConsent: v.boolean(),

    // Scoring and engagement
    leadScore: v.number(),
    engagementScore: v.number(),
    lastContactDate: v.optional(v.number()),
    nextFollowUpDate: v.optional(v.number()),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Notes
    description: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_owner", ["owner"])
    .index("by_company", ["company"])
    .index("by_leadScore", ["leadScore"]),

  // Lead Sources
  leadSources: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("inbound"),
      v.literal("outbound"),
      v.literal("referral"),
      v.literal("partner"),
      v.literal("website"),
      v.literal("social"),
      v.literal("other")
    ),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["isActive"]),

  // Leads
  leads: defineTable({
    // Basic information
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),

    // Lead details
    title: v.optional(v.string()),
    industry: v.optional(v.string()),
    annualRevenue: v.optional(v.number()),
    employeeCount: v.optional(v.number()),
    address: address,

    // Lead management
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("recycled"),
      v.literal("dead")
    ),
    rating: v.union(
      v.literal("hot"),
      v.literal("warm"),
      v.literal("cold")
    ),
    source: v.id("leadSources"),
    sourceDetail: v.optional(v.string()),

    // Assignment
    owner: v.id("users"),
    convertedToContact: v.optional(v.id("contacts")),
    convertedToAccount: v.optional(v.id("accounts")),
    convertedToOpportunity: v.optional(v.id("opportunities")),

    // Scoring and qualification
    leadScore: v.number(),
    maxScore: v.number(),
    qualificationScore: v.number(),
    isQualified: v.boolean(),
    qualificationDate: v.optional(v.number()),

    // Activity tracking
    firstContactDate: v.optional(v.number()),
    lastActivityDate: v.optional(v.number()),
    nextActivityDate: v.optional(v.number()),
    activityCount: v.number(),

    // Communication
    emailOptOut: v.boolean(),
    doNotCall: v.boolean(),
    preferredContact: v.union(
      v.literal("email"),
      v.literal("phone"),
      v.literal("sms")
    ),

    // Additional info
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.array(v.string()),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_score", ["leadScore"]),

  // Accounts (Companies)
  accounts: defineTable({
    // Company information
    name: v.string(),
    website: v.optional(v.string()),
    domain: v.optional(v.string()),
    description: v.optional(v.string()),

    // Industry and size
    industry: v.optional(v.string()),
    subIndustry: v.optional(v.string()),
    companySize: v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-500"),
      v.literal("501-1000"),
      v.literal("1000+")
    ),
    annualRevenue: v.optional(v.number()),
    employeeCount: v.optional(v.number()),

    // Address
    billingAddress: address,
    shippingAddress: address,

    // Contact details
    phone: v.optional(v.string()),
    fax: v.optional(v.string()),
    email: v.optional(v.string()),

    // Account management
    accountType: v.union(
      v.literal("prospect"),
      v.literal("customer"),
      v.literal("partner"),
      v.literal("vendor"),
      v.literal("reseller")
    ),
    owner: v.id("users"),
    parentAccount: v.optional(v.id("accounts")),

    // Status and tier
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("prospect"),
      v.literal("closed-won"),
      v.literal("closed-lost")
    ),
    tier: v.union(
      v.literal("tier-1"),
      v.literal("tier-2"),
      v.literal("tier-3")
    ),

    // CRM metrics
    score: v.number(),
    value: v.number(),
    opportunityCount: v.number(),
    contactCount: v.number(),

    // Dates
    firstContactDate: v.optional(v.number()),
    lastActivityDate: v.optional(v.number()),
    contractStartDate: v.optional(v.number()),
    contractEndDate: v.optional(v.number()),

    // Social media
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    facebook: v.optional(v.string()),

    // Additional info
    notes: v.optional(v.string()),
    tags: v.array(v.string()),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_name", ["name"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_type", ["accountType"])
    .index("by_domain", ["domain"]),

  // Opportunity Stages
  opportunityStages: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    probability: v.number(), // Default probability for this stage
    category: v.union(
      v.literal("prospecting"),
      v.literal("qualification"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed")
    ),
    isActive: v.boolean(),
    sortOrder: v.number(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_sort", ["sortOrder"]),

  // Opportunities (Deals)
  opportunities: defineTable({
    // Basic information
    name: v.string(),
    description: v.optional(v.string()),

    // Account and contacts
    account: v.id("accounts"),
    primaryContact: v.optional(v.id("contacts")),
    contacts: v.array(v.id("contacts")),

    // Deal details
    amount: v.number(),
    currency: v.string(),
    stage: v.id("opportunityStages"),
    probability: v.number(),
    closeDate: v.number(),

    // Deal type and source
    dealType: v.union(
      v.literal("new-business"),
      v.literal("existing-business"),
      v.literal("renewal"),
      v.literal("upsell"),
      v.literal("cross-sell")
    ),
    leadSource: v.optional(v.id("leadSources")),
    sourceDetail: v.optional(v.string()),

    // Competition and partnership
    competitors: v.array(v.string()),
    partners: v.array(v.string()),

    // Management
    owner: v.id("users"),
    campaign: v.optional(v.id("campaigns")),

    // Status and outcome
    status: v.union(
      v.literal("open"),
      v.literal("won"),
      v.literal("lost"),
      v.literal("cancelled")
    ),
    outcome: v.optional(v.union(
      v.literal("price-lost"),
      v.literal("feature-lost"),
      v.literal("competitor-lost"),
      v.literal("no-decision"),
      v.literal("other")
    )),
    outcomeReason: v.optional(v.string()),

    // Sales process
    nextStep: v.optional(v.string()),
    expectedRevenue: v.number(),
    budget: v.optional(v.boolean()),
    decisionMaker: v.optional(v.boolean()),
    needsAnalysis: v.optional(v.boolean()),
    solutionFit: v.optional(v.boolean()),

    // Timeline
    createdDate: v.number(),
    modifiedDate: v.number(),
    wonDate: v.optional(v.number()),
    lostDate: v.optional(v.number()),

    // Products/Services
    products: v.array(v.object({
      name: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
      discount: v.number(),
    })),

    // Additional info
    notes: v.optional(v.string()),
    tags: v.array(v.string()),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_account", ["account"])
    .index("by_owner", ["owner"])
    .index("by_stage", ["stage"])
    .index("by_closeDate", ["closeDate"])
    .index("by_status", ["status"]),

  // Campaigns
  campaigns: defineTable({
    // Campaign details
    name: v.string(),
    description: v.optional(v.string()),
    type: v.id("campaignTypes"),

    // Status and dates
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    startDate: v.number(),
    endDate: v.number(),

    // Budget and costs
    budget: v.optional(v.number()),
    actualCost: v.number(),
    currency: v.string(),

    // Targeting
    targetAudience: v.array(v.string()),
    targetAccounts: v.array(v.id("accounts")),
    excludeAccounts: v.array(v.id("accounts")),

    // Campaign settings
    isPublic: v.boolean(),
    sendNotifications: v.boolean(),
    trackResponses: v.boolean(),

    // Results
    sentCount: v.number(),
    openCount: v.number(),
    clickCount: v.number(),
    conversionCount: v.number(),
    unsubscribeCount: v.number(),

    // ROI metrics
    leadCount: v.number(),
    opportunityCount: v.number(),
    wonDealsValue: v.number(),
    roi: v.number(),

    // Management
    owner: v.id("users"),
    parentCampaign: v.optional(v.id("campaigns")),

    // Additional info
    notes: v.optional(v.string()),
    tags: v.array(v.string()),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_owner", ["owner"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_dates", ["startDate", "endDate"]),

  // Campaign Types
  campaignTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("email"),
      v.literal("social"),
      v.literal("webinar"),
      v.literal("event"),
      v.literal("direct-mail"),
      v.literal("advertising"),
      v.literal("content"),
      v.literal("other")
    ),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["isActive"]),

  // Activities
  activities: defineTable({
    // Activity details
    type: v.id("activityTypes"),
    subject: v.string(),
    description: v.optional(v.string()),

    // Status and priority
    status: v.union(
      v.literal("planned"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),

    // Associations
    lead: v.optional(v.id("leads")),
    contact: v.optional(v.id("contacts")),
    account: v.optional(v.id("accounts")),
    opportunity: v.optional(v.id("opportunities")),
    campaign: v.optional(v.id("campaigns")),

    // Dates
    activityDate: v.number(),
    duration: v.optional(v.number()), // in minutes

    // Location
    location: v.optional(v.string()),
    isVirtual: v.boolean(),
    meetingLink: v.optional(v.string()),

    // Participants
    owner: v.id("users"),
    attendees: v.array(v.id("users")),

    // Results
    outcome: v.optional(v.string()),
    nextStep: v.optional(v.string()),
    followUpDate: v.optional(v.number()),

    // Communication
    direction: v.union(
      v.literal("inbound"),
      v.literal("outbound")
    ),
    relatedTo: v.optional(v.string()), // Related record info

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Custom fields
    customFields: v.array(v.object({
      fieldId: v.id("customFields"),
      value: v.any(),
    })),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_owner", ["owner"])
    .index("by_date", ["activityDate"])
    .index("by_status", ["status"])
    .index("by_lead", ["lead"])
    .index("by_contact", ["contact"])
    .index("by_account", ["account"])
    .index("by_opportunity", ["opportunity"]),

  // Activity Types
  activityTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("task"),
      v.literal("note"),
      v.literal("letter"),
      v.literal("other")
    ),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    defaultDuration: v.optional(v.number()), // in minutes
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["isActive"]),

  // Tasks
  tasks: defineTable({
    // Task details
    title: v.string(),
    description: v.optional(v.string()),

    // Status and priority
    status: v.union(
      v.literal("not-started"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("deferred"),
      v.literal("todo") // Legacy status from existing data
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("medium"), // Legacy priority from existing data
      v.literal("high"),
      v.literal("urgent")
    ),

    // Associations
    lead: v.optional(v.id("leads")),
    contact: v.optional(v.id("contacts")),
    account: v.optional(v.id("accounts")),
    opportunity: v.optional(v.id("opportunities")),

    // Assignment (optional for backward compatibility)
    assignedTo: v.optional(v.id("users")),
    createdByUser: v.optional(v.id("users")),

    // Dates
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),

    // Task type (optional for backward compatibility)
    type: v.optional(v.id("taskTypes")),

    // Progress (optional, defaults to 0)
    progress: v.optional(v.number()), // 0-100

    // Dependencies (optional for backward compatibility)
    dependsOn: v.optional(v.array(v.id("tasks"))),

    // Additional info
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // Reminders (optional for backward compatibility)
    reminderDate: v.optional(v.number()),
    reminderSent: v.optional(v.boolean()),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_assigned", ["assignedTo"])
    .index("by_creator", ["createdByUser"])
    .index("by_dueDate", ["dueDate"])
    .index("by_status", ["status"])
    .index("by_lead", ["lead"])
    .index("by_contact", ["contact"])
    .index("by_account", ["account"])
    .index("by_opportunity", ["opportunity"]),

  // Task Types
  taskTypes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("follow-up"),
      v.literal("demo"),
      v.literal("proposal"),
      v.literal("research"),
      v.literal("other")
    ),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["isActive"]),

  // Email Templates
  emailTemplates: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("welcome"),
      v.literal("follow-up"),
      v.literal("proposal"),
      v.literal("newsletter"),
      v.literal("marketing"),
      v.literal("transactional"),
      v.literal("other")
    ),
    subject: v.string(),
    body: v.string(),
    variables: v.array(v.string()), // Template variables
    isActive: v.boolean(),
    isPublic: v.boolean(),
    language: v.string(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  // Email Tracking
  emailTracking: defineTable({
    // Email details
    fromEmail: v.string(),
    toEmail: v.string(),
    subject: v.string(),
    template: v.optional(v.id("emailTemplates")),

    // Associations
    lead: v.optional(v.id("leads")),
    contact: v.optional(v.id("contacts")),
    opportunity: v.optional(v.id("opportunities")),

    // Tracking
    sentDate: v.number(),
    openedDate: v.optional(v.number()),
    clickDate: v.optional(v.number()),
    repliedDate: v.optional(v.number()),
    bouncedDate: v.optional(v.number()),

    // Status
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("replied"),
      v.literal("bounced"),
      v.literal("failed")
    ),

    // Metrics
    openCount: v.number(),
    clickCount: v.number(),

    // Workspace
    workspaceId: v.id("workspaces"),
  })
    .index("by_contact", ["contact"])
    .index("by_lead", ["lead"])
    .index("by_status", ["status"])
    .index("by_date", ["sentDate"]),

  // Notes
  notes: defineTable({
    // Note details
    title: v.optional(v.string()),
    content: v.string(),
    noteType: v.union(
      v.literal("general"),
      v.literal("call"),
      v.literal("meeting"),
      v.literal("email"),
      v.literal("task")
    ),

    // Associations
    lead: v.optional(v.id("leads")),
    contact: v.optional(v.id("contacts")),
    account: v.optional(v.id("accounts")),
    opportunity: v.optional(v.id("opportunities")),

    // Visibility
    isInternal: v.boolean(),
    isPrivate: v.boolean(),

    // Author
    author: v.id("users"),

    // Attachments
    attachments: v.array(v.id("_storage")),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead", ["lead"])
    .index("by_contact", ["contact"])
    .index("by_account", ["account"])
    .index("by_opportunity", ["opportunity"])
    .index("by_author", ["author"])
    .index("by_date", ["createdAt"]),

  // Custom Fields
  customFields: defineTable({
    // Field details
    name: v.string(),
    label: v.string(),
    description: v.optional(v.string()),

    // Field type
    fieldType: v.union(
      v.literal("text"),
      v.literal("textarea"),
      v.literal("number"),
      v.literal("currency"),
      v.literal("date"),
      v.literal("datetime"),
      v.literal("boolean"),
      v.literal("select"),
      v.literal("multi-select"),
      v.literal("url"),
      v.literal("email"),
      v.literal("phone")
    ),

    // Configuration
    isRequired: v.boolean(),
    isUnique: v.boolean(),
    defaultValue: v.optional(v.any()),

    // Options for select fields
    options: v.array(v.object({
      value: v.string(),
      label: v.string(),
      order: v.number(),
    })),

    // Scope
    appliesTo: v.array(v.string()), // Entity types this field applies to

    // Display
    sortOrder: v.number(),
    isHidden: v.boolean(),

    // Validation
    validationRules: v.array(v.object({
      type: v.string(),
      value: v.any(),
      message: v.string(),
    })),

    // Status
    isActive: v.boolean(),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_active", ["isActive"]),

  // Tags
  tags: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    category: v.optional(v.string()),
    scope: v.union(
      v.literal("global"),
      v.literal("contact"),
      v.literal("lead"),
      v.literal("account"),
      v.literal("opportunity"),
      v.literal("campaign")
    ),
    usageCount: v.number(),
    isActive: v.boolean(),
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_scope", ["scope"])
    .index("by_usage", ["usageCount"]),

  // Sales Forecasts
  salesForecasts: defineTable({
    // Forecast period
    period: v.string(), // e.g., "2024-Q1", "2024-01"
    forecastType: v.union(
      v.literal("opportunity"),
      v.literal("pipeline"),
      v.literal("quota")
    ),

    // Owner
    owner: v.optional(v.id("users")),
    team: v.optional(v.string()),

    // Forecasts
    quota: v.number(),
    forecast: v.number(),
    pipeline: v.number(),
    bestCase: v.number(),
    worstCase: v.number(),

    // Actuals
    actual: v.optional(v.number()),
    variance: v.optional(v.number()),

    // Currency
    currency: v.string(),

    // Workspace and audit
    workspaceId: v.id("workspaces"),
    createdAt: v.number(),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_owner", ["owner"])
    .index("by_period", ["period"]),
});
