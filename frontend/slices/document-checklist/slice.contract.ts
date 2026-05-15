/**
 * Slice contract for `document-checklist` — Phase A.
 *
 * Job-search document tracker with country-scoped seed templates and
 * per-user completion state. Auth identity resolved via convex-auth.
 *
 * Tables are slug-prefixed per kitab convention (`document_checklist_*`).
 *
 * Authored 2026-05-15 (harvested from CareerPack).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "document-checklist",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["document-checklist.read", "document-checklist.write"],
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["document_checklist_items", "document_checklist_templates"],
    hooks: ["useChecklistData"],
  },
  conflicts: [],
});
