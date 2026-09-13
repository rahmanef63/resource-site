type AuditLogRegistryConfig = {
  slug: string;
  title: string;
  category: "infra";
  routes: unknown[];
  nav: { label: string; group: "tools"; order: number };
};

/** Framework-neutral registry metadata for the backend-only audit-log slice. */
export const auditLogConfig = {
  slug: "audit-log",
  title: "Audit Log — Workspace Events",
  category: "infra",
  routes: [],
  nav: { label: "Audit Log", group: "tools", order: 80 },
} satisfies AuditLogRegistryConfig;
