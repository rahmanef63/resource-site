// This is the single source of truth for default menu items.
// It is safe to import in Convex server functions.
//
// AUTO-GENERATED - DO NOT EDIT MANUALLY.
// Source: frontend/slices/*/config.ts (auto-discovered)
// Update via: pnpm run sync:features

export const DEFAULT_MENU_ITEMS = [
  {
    name: "Overview" as const,
    slug: "overview" as const,
    type: "route" as const,
    icon: "Home" as const,
    path: "/dashboard/overview",
    component: "OverviewPage" as const,
    order: 1,
    metadata: {
      description: "Dashboard overview with analytics and insights",
      version: "1.0.0",
      category: "analytics" as const,
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "overview.view",
      originalRequiresPermission: "overview.view"
    },
    requiresPermission: "overview.view"
  },
  {
    name: "Communications" as const,
    slug: "communications" as const,
    type: "route" as const,
    icon: "MessageSquare" as const,
    path: "/dashboard/communications",
    component: "CommunicationsPage" as const,
    order: 1,
    metadata: {
      description: "Unified communication platform with channels, direct messages, voice/video calls, and AI integrations",
      version: "1.0.0",
      category: "communication" as const,
      tags: [
        "communication",
        "chat",
        "channels",
        "calls",
        "voice",
        "video",
        "messaging",
        "dm",
        "ai"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "communications.view",
      originalRequiresPermission: "communications.view"
    },
    requiresPermission: "communications.view"
  },
  {
    name: "AI" as const,
    slug: "ai" as const,
    type: "route" as const,
    icon: "Bot" as const,
    path: "/dashboard/ai",
    component: "AIView" as const,
    order: 4,
    metadata: {
      description: "AI assistant",
      version: "2.0.0",
      category: "communication" as const,
      tags: [
        "ai",
        "assistant",
        "automation"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "ai.view",
      originalRequiresPermission: "ai.view"
    },
    requiresPermission: "ai.view"
  },
  {
    name: "Store" as const,
    slug: "store" as const,
    type: "route" as const,
    icon: "Store" as const,
    path: "/dashboard/store",
    component: "StorePage" as const,
    order: 5,
    metadata: {
      description: "Unified store: workspace hierarchy + menu management. Role-gated tabs — Workspace visible to all members, Menu visible to roles with manage_menus permission.",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "workspace",
        "menus",
        "system",
        "administration"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_WORKSPACES",
      originalRequiresPermission: "MANAGE_WORKSPACES"
    },
    requiresPermission: "MANAGE_WORKSPACES"
  },
  {
    name: "Knowledge" as const,
    slug: "knowledge" as const,
    type: "route" as const,
    icon: "BookOpen" as const,
    path: "/dashboard/knowledge",
    component: "KnowledgePage" as const,
    order: 5,
    metadata: {
      description: "Centralized knowledge base with documents, articles, and AI-consumable data",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "knowledge",
        "documents",
        "ai",
        "wiki",
        "articles",
        "profile"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "knowledge.view",
      originalRequiresPermission: "knowledge.view"
    },
    requiresPermission: "knowledge.view"
  },
  {
    name: "Contacts" as const,
    slug: "contacts" as const,
    type: "route" as const,
    icon: "Contact" as const,
    path: "/dashboard/contacts",
    component: "ContactsLayout" as const,
    order: 5,
    metadata: {
      description: "Manage your contacts and connections",
      version: "1.0.0",
      category: "social" as const,
      tags: [
        "social",
        "connections",
        "networking",
        "contacts"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "contacts.view",
      originalRequiresPermission: "contacts.view"
    },
    requiresPermission: "contacts.view"
  },
  {
    name: "Database" as const,
    slug: "database" as const,
    type: "route" as const,
    icon: "Database" as const,
    path: "/dashboard/database",
    component: "DatabasePage" as const,
    order: 7,
    metadata: {
      description: "Notion-style database views and management",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "database",
        "tables",
        "data-management"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "database.read",
      originalRequiresPermission: "database.read"
    },
    requiresPermission: "database.read"
  },
  {
    name: "User Management",
    slug: "user-management",
    type: "route" as const,
    icon: "UserCog" as const,
    path: "/dashboard/user-management",
    component: "UserManagementPage" as const,
    order: 12,
    metadata: {
      description: "Unified user management: members, teams, invitations, and role hierarchy",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "users",
        "members",
        "teams",
        "roles",
        "invitations",
        "access-control"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "MANAGE_MEMBERS",
      originalRequiresPermission: "MANAGE_MEMBERS"
    },
    requiresPermission: "MANAGE_MEMBERS"
  },
  {
    name: "Content Library",
    slug: "content" as const,
    type: "route" as const,
    icon: "Library" as const,
    path: "/dashboard/content",
    component: "ContentPage" as const,
    order: 100,
    metadata: {
      description: "Centralized content management for images, videos, audio, and documents with AI generation capabilities.",
      version: "1.0.0",
      category: "creativity" as const,
      tags: [
        "content",
        "creativity"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "content.view",
      originalRequiresPermission: "content.view"
    },
    requiresPermission: "content.view"
  },
  {
    name: "CMS Lite (deprecated)",
    slug: "cms-lite",
    type: "route" as const,
    icon: "Box" as const,
    path: "/dashboard/cms-lite",
    component: "CmsLitePage" as const,
    order: 100,
    metadata: {
      description: "Deprecated 2026-05-07 — use Blog slice for content publishing. Notion-clone (sibling project) will replace remaining cms-lite surfaces. See docs/coordination/cms-lite-removal-plan.md.",
      version: "1.0.0",
      category: "productivity" as const,
      tags: [
        "cms-lite",
        "productivity"
      ],
      featureType: "default" as const,
      originalFeatureType: "default" as const,
      requiresPermission: "cart.checkout",
      originalRequiresPermission: "cart.checkout"
    },
    requiresPermission: "cart.checkout"
  },
  {
    name: "Platform Admin",
    slug: "platform-admin",
    type: "route" as const,
    icon: "Shield" as const,
    path: "/dashboard/platform-admin",
    component: "PlatformAdminPageNew" as const,
    order: 999,
    metadata: {
      description: "Super Admin panel for managing features, workspaces, and system configuration",
      version: "1.0.0",
      category: "administration" as const,
      tags: [
        "admin",
        "system",
        "platform",
        "management",
        "superadmin"
      ],
      featureType: "system" as const,
      originalFeatureType: "system" as const,
      requiresPermission: "PLATFORM_ADMIN",
      originalRequiresPermission: "PLATFORM_ADMIN"
    },
    requiresPermission: "PLATFORM_ADMIN"
  }
]
