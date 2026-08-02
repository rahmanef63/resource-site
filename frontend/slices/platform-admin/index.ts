// Slice public barrel — contract-only scaffold. Implementation lands via
// /rr-send platform-admin from superspace (see docs/contract-negotiations-2026-05-15.md §4).
//
// Note: the composition contract now lives folded into `slice.json` under a
// `contract` block (read by validators/tooling), not in app source. Don't
// re-export contract internals from this barrel — keep it config + tools only
// so nothing outside the Next compile root gets pulled into the prod build.
export { platformAdminConfig } from "./config";
export { platformAdminTools, type PlatformAdminCtx } from "./lib/tools";
