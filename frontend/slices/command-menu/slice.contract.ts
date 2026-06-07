/**
 * Slice contract for `command-menu` — v0.2.0.
 *
 * Renderless ⌘K command palette + generic search modal. Pulled UP from
 * notion-page-clone's `command-palette` slice (Wave N+3.7) at notion's
 * `consumerVersion: "0.3.0"` portable surface — Nosion-bound adapters were
 * dropped at the boundary. Consumer wires `groups`, `onNavigate`, and
 * `labels` props; the slice owns dialog chrome, hotkey, and MRU history.
 *
 * Per docs/contract-negotiations-2026-05-15.md follow-up #14.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "command-menu",
  version: "0.2.0",
  requires: {
    deps: [],
  },
  provides: {
    components: ["CommandPalette", "SearchModal", "CommandGroupList"],
  },
  generalization: {
    level: "portable",
    forbiddenTerms: ["nosion", "Nosion"],
    requiredProps: ["groups", "onNavigate", "labels"],
  },
});
