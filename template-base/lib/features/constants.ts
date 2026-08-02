export const FEATURE_UI_CATEGORIES = [
  "communication",
  "productivity",
  "collaboration",
  "administration",
  "social",
  "creativity",
  "analytics",
  "content",
] as const;

export type FeatureUiCategory = (typeof FEATURE_UI_CATEGORIES)[number];

export const FEATURE_TYPES = [
  "default",
  "system",
  "optional",
  "experimental",
] as const;

export type FeatureType = (typeof FEATURE_TYPES)[number];

export const FEATURE_STATUS_STATES = [
  "stable",
  "beta",
  "development",
  "experimental",
  "deprecated",
] as const;

export type FeatureStatusState = (typeof FEATURE_STATUS_STATES)[number];

export const FEATURE_BUNDLE_IDS = [
  "startup",
  "business-pro",
  "sales-crm",
  "project-management",
  "knowledge-base",
  "personal-minimal",
  "personal-productivity",
  "family",
  "content-creator",
  "digital-agency",
  "education",
  "community",
  "custom",
] as const;

export type FeatureBundleId = (typeof FEATURE_BUNDLE_IDS)[number];

export const FEATURE_MENU_ITEM_TYPES = [
  "route",
  "folder",
  "group",
  "divider",
  "action",
  "chat",
  "document",
] as const;

export type FeatureMenuItemType = (typeof FEATURE_MENU_ITEM_TYPES)[number];

export const FEATURE_PACKAGE_SOURCES = [
  "builtin",
  "external",
  "studio",
] as const;

export type FeaturePackageSource = (typeof FEATURE_PACKAGE_SOURCES)[number];

export const FEATURE_PACKAGE_RUNTIMES = [
  "interpreted",
  "compiled",
  "hybrid",
] as const;

export type FeaturePackageRuntime = (typeof FEATURE_PACKAGE_RUNTIMES)[number];

export const FEATURE_GENERATION_MODES = [
  "full-json",
  "hybrid-json",
  "engine-owned",
] as const;

export type FeatureGenerationMode =
  (typeof FEATURE_GENERATION_MODES)[number];

export const FEATURE_ACTION_KINDS = [
  "workflow",
  "query",
  "mutation",
  "crud",
  "form",
  "view",
  "trigger",
] as const;

export type FeatureActionKind = (typeof FEATURE_ACTION_KINDS)[number];

export const FEATURE_PERMISSION_SOURCES = [
  "system",
  "feature",
  "workspace",
  "generated",
] as const;

export type FeaturePermissionSource =
  (typeof FEATURE_PERMISSION_SOURCES)[number];

export const FEATURE_PACKAGE_VERSIONING_STRATEGIES = [
  "replace",
  "compatible-upgrade",
  "migration-required",
] as const;

export type FeaturePackageVersioningStrategy =
  (typeof FEATURE_PACKAGE_VERSIONING_STRATEGIES)[number];

export const FEATURE_INSTALL_STATUSES = [
  "draft",
  "planned",
  "installing",
  "installed",
  "upgrading",
  "failed",
  "rolled_back",
  "uninstalled",
] as const;

export type FeatureInstallStatus = (typeof FEATURE_INSTALL_STATUSES)[number];

export const FEATURE_BINDING_STATUSES = [
  "planned",
  "installed",
  "removed",
  "failed",
] as const;

export type FeatureBindingStatus =
  (typeof FEATURE_BINDING_STATUSES)[number];

export const FEATURE_MIGRATION_STATUSES = [
  "not_required",
  "pending",
  "running",
  "completed",
  "failed",
  "rolled_back",
] as const;

export type FeatureMigrationStatus =
  (typeof FEATURE_MIGRATION_STATUSES)[number];

export const FEATURE_DATA_MODEL_STATUSES = [
  "none",
  "deferred",
  "compiled",
] as const;

export type FeatureDataModelStatus =
  (typeof FEATURE_DATA_MODEL_STATUSES)[number];

export const FEATURE_DATA_FIELD_TYPES = [
  "text",
  "number",
  "select",
  "multiSelect",
  "date",
  "person",
  "files",
  "checkbox",
  "url",
  "email",
  "phone",
  "formula",
  "relation",
  "rollup",
  "richText",
  "json",
  "media",
  "autoId",
  "status",
  "createdTime",
  "lastEditedTime",
  "createdBy",
  "lastEditedBy",
] as const;

export type FeatureDataFieldType =
  (typeof FEATURE_DATA_FIELD_TYPES)[number];

export const FEATURE_VIEW_TYPES = [
  "table",
  "board",
  "calendar",
  "gallery",
  "list",
  "timeline",
] as const;

export type FeatureViewType = (typeof FEATURE_VIEW_TYPES)[number];

export const WORKSPACE_OWNER_TYPES = [
  "system",
  "workspace",
  "user",
  "cms",
] as const;

export type WorkspaceOwnerType = (typeof WORKSPACE_OWNER_TYPES)[number];

export const WORKSPACE_TYPES = [
  "organization",
  "institution",
  "group",
  "family",
  "personal",
] as const;

export type WorkspaceType = (typeof WORKSPACE_TYPES)[number];

export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export function isFeatureUiCategory(value: string): value is FeatureUiCategory {
  return (FEATURE_UI_CATEGORIES as readonly string[]).includes(value);
}

export function isFeatureType(value: string): value is FeatureType {
  return (FEATURE_TYPES as readonly string[]).includes(value);
}

export function isSemver(value: string): boolean {
  return SEMVER_REGEX.test(value);
}
