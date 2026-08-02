// Centralized permission constants (SSOT)
// Use these everywhere instead of ad-hoc strings.

export const PERMS = {
  MANAGE_WORKSPACE: "manage_workspace",
  MANAGE_MEMBERS: "manage_members",
  INVITE_MEMBERS: "invite_members",
  MANAGE_ROLES: "manage_roles",
  MANAGE_MENUS: "manage_menus",
  MANAGE_INVITATIONS: "manage_invitations",

  DOCUMENTS_CREATE: "documents.create",
  DOCUMENTS_EDIT: "documents.edit",
  DOCUMENTS_DELETE: "documents.delete",
  DOCUMENTS_MANAGE: "documents.manage",
  DOCUMENTS_UPDATE: "documents.update",
  DOCUMENTS_PUBLISH: "documents.publish",

  // CMS Permissions
  SCHEMAS_CREATE: "schemas.create",
  SCHEMAS_UPDATE: "schemas.update",
  SCHEMAS_DELETE: "schemas.delete",
  SCHEMAS_MANAGE: "schemas.manage",

  ASSETS_UPLOAD: "assets.upload",
  ASSETS_DELETE: "assets.delete",
  ASSETS_MANAGE: "assets.manage",

  CREATE_CONVERSATIONS: "create_conversations",
  MANAGE_CONVERSATIONS: "manage_conversations",

  VIEW_WORKSPACE: "view_workspace",
  COMMUNICATIONS_VIEW: "communications.view",
  COMMUNICATIONS_MANAGE: "communications.manage",

  // Content
  CONTENT_VIEW: "content.view",
  CONTENT_MANAGE: "content.manage",

  // Database Permissions
  DATABASE_READ: "database.read",
  DATABASE_CREATE: "database.create",
  DATABASE_UPDATE: "database.update",
  DATABASE_DELETE: "database.delete",
  DATABASE_MANAGE: "database.manage",

  // CRM
  CRM_VIEW: "crm.view",
  CRM_MANAGE: "crm.manage",

  // Tasks
  TASKS_VIEW: "tasks.view",
  TASKS_MANAGE: "tasks.manage",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_MANAGE: "projects.manage",

  // Accounting
  ACCOUNTING_VIEW: "accounting.view",
  ACCOUNTING_MANAGE: "accounting.manage",

  // HR
  HR_VIEW: "hr.view",
  HR_MANAGE: "hr.manage",

  // Sales
  SALES_VIEW: "sales.view",
  SALES_MANAGE: "sales.manage",

  // Marketing
  MARKETING_VIEW: "marketing.view",
  MARKETING_MANAGE: "marketing.manage",

  // Automation
  AUTOMATION_VIEW: "automation.view",
  AUTOMATION_MANAGE: "automation.manage",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_MANAGE: "analytics.manage",

  // Approvals
  APPROVALS_VIEW: "approvals.view",
  APPROVALS_MANAGE: "approvals.manage",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_MANAGE: "inventory.manage",

  // Calendar
  CALENDAR_VIEW: "calendar.view",
  CALENDAR_MANAGE: "calendar.manage",

  // Calls
  CALLS_VIEW: "calls.view",
  CALLS_MANAGE: "calls.manage",

  // Comments
  COMMENTS_VIEW: "comments.view",
  COMMENTS_MANAGE: "comments.manage",

  // Contacts
  CONTACTS_VIEW: "contacts.view",
  CONTACTS_MANAGE: "contacts.manage",

  // Forms
  FORMS_VIEW: "forms.view",
  FORMS_MANAGE: "forms.manage",

  // Integrations
  INTEGRATIONS_VIEW: "integrations.view",
  INTEGRATIONS_MANAGE: "integrations.manage",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications.view",
  NOTIFICATIONS_MANAGE: "notifications.manage",

  // POS
  POS_VIEW: "pos.view",
  POS_MANAGE: "pos.manage",

  // Search
  SEARCH_VIEW: "search.view",

  // Status
  STATUS_VIEW: "status.view",
  STATUS_MANAGE: "status.manage",

  // Support
  SUPPORT_VIEW: "support.view",
  SUPPORT_MANAGE: "support.manage",

  // Tags
  TAGS_VIEW: "tags.view",
  TAGS_MANAGE: "tags.manage",

  // Wiki
  WIKI_VIEW: "wiki.view",
  WIKI_MANAGE: "wiki.manage",

  // Guest Booking (hospitality)
  GUEST_BOOKING_VIEW: "guest-booking.view",
  GUEST_BOOKING_CREATE: "guest-booking.create",
  GUEST_BOOKING_UPDATE: "guest-booking.update",
  GUEST_BOOKING_VERIFY: "guest-booking.verify",
  GUEST_BOOKING_CANCEL: "guest-booking.cancel",

  // Staff Operations (hospitality)
  STAFF_OPERATIONS_VIEW: "staff-operations.view",
  STAFF_OPERATIONS_CREATE: "staff-operations.create",
  STAFF_OPERATIONS_UPDATE: "staff-operations.update",
  STAFF_OPERATIONS_ASSIGN: "staff-operations.assign",

  // Owner Analytics (hospitality)
  OWNER_ANALYTICS_VIEW: "owner-analytics.view",
  OWNER_ANALYTICS_MANAGE: "owner-analytics.manage",

  // Generic — Tier 1 finance ops (merge backfill)
  PETTY_CASH_VIEW: "pettyCash.view",
  PETTY_CASH_REQUEST: "pettyCash.request",
  PETTY_CASH_APPROVE: "pettyCash.approve",
  PETTY_CASH_DISBURSE: "pettyCash.disburse",
  PETTY_CASH_CLOSE: "pettyCash.close",

  DAILY_CLOSING_VIEW: "dailyClosing.view",
  DAILY_CLOSING_OPEN: "dailyClosing.open",
  DAILY_CLOSING_RECORD: "dailyClosing.record",
  DAILY_CLOSING_CLOSE: "dailyClosing.close",
  DAILY_CLOSING_APPROVE: "dailyClosing.approve",

  OWNER_TRANSFERS_VIEW: "ownerTransfers.view",
  OWNER_TRANSFERS_CREATE: "ownerTransfers.create",
  OWNER_TRANSFERS_APPROVE: "ownerTransfers.approve",

  CASH_FLOW_FORECAST_VIEW: "cashFlowForecast.view",
  CASH_FLOW_FORECAST_GENERATE: "cashFlowForecast.generate",
  CASH_FLOW_FORECAST_PUBLISH: "cashFlowForecast.publish",

  // Generic — Tier 2 ops
  DAMAGE_REPORTS_VIEW: "damageReports.view",
  DAMAGE_REPORTS_CREATE: "damageReports.create",
  DAMAGE_REPORTS_TRIAGE: "damageReports.triage",
  DAMAGE_REPORTS_RESOLVE: "damageReports.resolve",

  CHECKLIST_VIEW: "checklist.view",
  CHECKLIST_TEMPLATE_EDIT: "checklist.template.edit",
  CHECKLIST_RUN_COMPLETE: "checklist.run.complete",
  CHECKLIST_RUN_REVIEW: "checklist.run.review",

  ASSETS_VIEW: "assets.view",
  ASSETS_REGISTER: "assets.register",
  ASSETS_TRANSFER: "assets.transfer",
  ASSETS_RETIRE: "assets.retire",

  MAINTENANCE_VIEW: "maintenance.view",
  MAINTENANCE_SCHEDULE: "maintenance.schedule",
  MAINTENANCE_COMPLETE: "maintenance.complete",

  // Generic — Tier 3 intelligence
  KPI_THRESHOLDS_VIEW: "kpiThresholds.view",
  KPI_THRESHOLDS_DEFINE: "kpiThresholds.define",
  KPI_THRESHOLDS_ACKNOWLEDGE: "kpiThresholds.acknowledge",

  BRANCH_HEALTH_VIEW: "branchHealth.view",
  BRANCH_HEALTH_CONFIGURE: "branchHealth.configure",

  LOYALTY_VIEW: "loyalty.view",
  LOYALTY_MEMBER_MANAGE: "loyalty.member.manage",
  LOYALTY_TRANSACTION_ADJUST: "loyalty.transaction.adjust",

  // ETL — weekly report ingestion
  ETL_VIEW: "etl.view",
  ETL_UPLOAD: "etl.upload",
  ETL_DELETE: "etl.delete",

  // Blog
  BLOG_VIEW: "blog.view",
  BLOG_CREATE: "blog.create",
  BLOG_PUBLISH: "blog.publish",
  BLOG_DELETE: "blog.delete",
} as const;

export type Permission = (typeof PERMS)[keyof typeof PERMS];

// Legacy alias for compatibility
export const PERMISSIONS = PERMS;
