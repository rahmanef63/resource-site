import { notFound } from "next/navigation";
import { AdminFeatureCard } from "./AdminFeatureCard";
import { ADMIN_PANEL_BLOCKS } from "./feature-blocks";
import { UsersBlockView } from "./blocks/users/UsersBlockView";

/**
 * BG-wave — shared stub renderer used by every per-template admin
 * panel feature route. Each template's
 * `/dashboard/admin/admin-panel/<segment>/page.tsx` just calls
 * `<AdminFeatureStubPage segment="ai-config" />` — no per-template
 * duplication.
 *
 * BS-canary (2026-05-20) — dispatches to a real block view when one
 * exists. Currently only `users` has a real impl (UsersBlockView).
 * Other 5 segments still render AdminFeatureCard placeholder. Add a
 * new `_shared/admin-panel/blocks/<segment>/<Segment>BlockView.tsx`
 * and a case here to graduate another block.
 */
export function AdminFeatureStubPage({ segment }: { segment: string }) {
  const block = ADMIN_PANEL_BLOCKS.find((b) => b.segment === segment);
  if (!block) notFound();
  if (segment === "users") return <UsersBlockView />;
  return <AdminFeatureCard block={block} />;
}
