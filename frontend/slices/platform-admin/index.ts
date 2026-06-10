// Slice public barrel — contract-only scaffold. Implementation lands via
// /rr-send platform-admin from superspace (see docs/contract-negotiations-2026-05-15.md §4).
//
// Note: `slice.contract.ts` is excluded from the Next.js build via tsconfig.
// Tooling (validators, scan-consumers) reads it directly. Don't re-export from
// this barrel — doing so pulls the contract into the app compile graph and
// breaks the prod build (it imports from packages/cli/lib/contract.ts which
// lives outside the Next compile root).
export { platformAdminConfig } from "./config";
export { platformAdminTools, type PlatformAdminCtx } from "./lib/tools";
