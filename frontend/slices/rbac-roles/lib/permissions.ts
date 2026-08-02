// Permission catalog + matcher. Permissions are dot-namespaced strings
// (`feature.action`). `*` = superadmin; `feature.*` = every action in a
// feature. This curated core set covers the common surfaces; consumers
// extend with their own keys (Permission is an open string union).

export const PERMS = {
  WORKSPACE_VIEW: "workspace.view",
  WORKSPACE_MANAGE: "workspace.manage",
  WORKSPACE_DELETE: "workspace.delete",
  MEMBERS_VIEW: "members.view",
  MEMBERS_MANAGE: "members.manage",
  MEMBERS_INVITE: "members.invite",
  ROLES_VIEW: "roles.view",
  ROLES_MANAGE: "roles.manage",
  INVITATIONS_MANAGE: "invitations.manage",
  CONTENT_VIEW: "content.view",
  CONTENT_CREATE: "content.create",
  CONTENT_EDIT: "content.edit",
  CONTENT_DELETE: "content.delete",
  CONTENT_PUBLISH: "content.publish",
  DATABASE_VIEW: "database.view",
  DATABASE_CREATE: "database.create",
  DATABASE_EDIT: "database.edit",
  DATABASE_DELETE: "database.delete",
  DOCUMENTS_VIEW: "documents.view",
  DOCUMENTS_CREATE: "documents.create",
  DOCUMENTS_EDIT: "documents.edit",
  DOCUMENTS_DELETE: "documents.delete",
  COMMENTS_VIEW: "comments.view",
  COMMENTS_CREATE: "comments.create",
  COMMENTS_MANAGE: "comments.manage",
  BILLING_VIEW: "billing.view",
  BILLING_MANAGE: "billing.manage",
  ANALYTICS_VIEW: "analytics.view",
  SETTINGS_MANAGE: "settings.manage",
  AUDIT_VIEW: "audit.view",
  SUPERADMIN: "*",
} as const;

export type CorePermission = (typeof PERMS)[keyof typeof PERMS];
// Open union — core keys autocomplete, consumer-defined keys still allowed.
export type Permission = CorePermission | (string & {});

/** Does a granted permission satisfy the wanted one?
 *  - `*` grants everything
 *  - exact string match
 *  - `feature.*` matches any `feature.<action>` */
export function matchPermission(granted: string, wanted: string): boolean {
  if (granted === "*") return true;
  if (granted === wanted) return true;
  if (granted.endsWith(".*")) return wanted.startsWith(granted.slice(0, -1));
  return false;
}
