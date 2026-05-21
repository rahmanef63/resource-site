import { notFound } from "next/navigation";
import { AdminFeatureCard } from "./AdminFeatureCard";
import { ADMIN_PANEL_BLOCKS } from "./feature-blocks";
import { UsersBlockView } from "./blocks/users/UsersBlockView";
import { AuditLogBlockView } from "./blocks/audit-log/AuditLogBlockView";
import { AiConfigBlockView } from "./blocks/ai-config/AiConfigBlockView";

/**
 * BG-wave — shared stub renderer used by every per-template admin
 * panel feature route. Each template's
 * `/dashboard/admin/admin-panel/<segment>/page.tsx` just calls
 * `<AdminFeatureStubPage segment="ai-config" />` — no per-template
 * duplication.
 *
 * BS-canary (2026-05-20) — dispatches to a real block view when one
 * exists. BT-wave (2026-05-20) — audit-log added. Remaining 4 segments
 * (ai-config, analytics, webhooks, settings) still render
 * AdminFeatureCard placeholder. Add a new
 * `_shared/admin-panel/blocks/<segment>/<Segment>BlockView.tsx`
 * and a case here to graduate another block.
 */
export function AdminFeatureStubPage({ segment }: { segment: string }) {
  const block = ADMIN_PANEL_BLOCKS.find((b) => b.segment === segment);
  if (!block) notFound();
  if (segment === "users") return <UsersBlockView />;
  if (segment === "audit-log") return <AuditLogBlockView />;
  if (segment === "ai-config") return <AiConfigBlockView />;
  return <AdminFeatureCard block={block} />;
}
