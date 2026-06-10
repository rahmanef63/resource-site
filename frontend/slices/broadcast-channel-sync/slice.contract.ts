/**
 * Slice contract for `broadcast-channel-sync` — Phase A.
 *
 * Pure-browser cross-tab + cross-iframe state sync. Uses the BroadcastChannel
 * API with a `storage` event fallback for Safari < 15.4. No backend, no auth,
 * no Convex tables, no env vars — frontend-only utility hook.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "broadcast-channel-sync",
  version: "0.2.0",
  requires: {
    auth: "none",
  },
  provides: {
    tools: ["broadcast-channel-sync.read", "broadcast-channel-sync.publish"],
    hooks: ["useBroadcastSync"],
  },
  generalization: {
    level: "portable",
  },
});
