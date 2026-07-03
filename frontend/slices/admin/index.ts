// admin — access-gated admin surfaces behind one slug. Two variants:
//   shell    — a minimal generic single-instance admin shell (titled card +
//              buildAdminStats factory) over convex/features/admin.
//   console   — the composed multi-section console: an access-gated two-column
//              shell driving a section registry that mounts other rr slices
//              (users / roles / analytics / audit / …) over convex/features/
//              admin_console.
// Install one with `npx rr add admin shell|console`, or both with
// `npx rr add admin`. Each variant pulls ONLY its own convex backend.
export * from "./variants/shell";
export * from "./variants/console";
export { adminFeature } from "./config";
