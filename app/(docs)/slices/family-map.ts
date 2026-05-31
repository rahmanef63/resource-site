/** Second-level grouping within each category tab on /slices. Slices
 *  whose slug shares a family (notion-*, ai-*, database-*, …) cluster
 *  together under a labeled sub-header. Singletons fall back to the
 *  flat row. */

const FAMILY_OVERRIDES: Record<string, string> = {
  // payment processors
  "doku-payment": "payment",
  "midtrans-payment": "payment",
  // landing page sections
  "landing-sections": "landing",
  "services": "landing",
  "testimonials": "landing",
  "contact-form-resend": "landing",
  // admin / dashboard shells
  "admin": "admin",
  "admin-panel": "admin",
  "platform-admin": "admin",
  "audit-log": "admin",
  "dashboard-shell": "admin",
  "workspace-shell": "admin",
  "rbac-roles": "admin",
  "event-tracking": "admin",
  // content / editorial
  "mdx-blog": "content",
  "comments": "content",
};

export const FAMILY_LABEL: Record<string, string> = {
  notion: "Notion family",
  ai: "AI",
  database: "Database",
  theme: "Theme",
  payment: "Payment",
  landing: "Landing sections",
  admin: "Admin / workspace",
  content: "Content",
};

export function familyOfSlug(slug: string): string | null {
  const override = FAMILY_OVERRIDES[slug];
  if (override) return override;
  const prefix = slug.split("-")[0];
  if (["notion", "ai", "database", "theme"].includes(prefix)) return prefix;
  return null;
}
