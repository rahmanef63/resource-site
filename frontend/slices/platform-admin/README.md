# `platform-admin`

Framework-neutral privileged control-plane tool contract. The canonical slice ships metadata plus agentic tool definitions; it does **not** ship a tenant database, KPI dashboard, admin renderer, or Convex schema.

## Install

- React/Next default: `npx rr add platform-admin`
- SvelteKit explicit: `npx rr add platform-admin --framework sveltekit`

Both install the same TypeScript source. There is intentionally no React or Svelte component because no canonical renderer exists yet.

## Host adapter

Bind `PlatformAdminCtx` at the server/tool-host boundary:

- `metrics()` — read platform KPI / tenant-health summary.
- `setFeatureFlag(key, value)` — privileged feature-flag mutation.
- `setTier(tenantId, tier)` — privileged tenant-tier mutation.

The host is responsible for authentication, authorization, tenancy, persistence, audit logging, and confirmation policy. At minimum, enforce the permissions declared by `slice.json` before binding these methods.

## Future UI/backend promotion

A future portable dashboard or Convex implementation must be promoted as real source before it is added to this slice contract. Do not infer tables, routes, KPI values, or tenant lifecycle behavior from the tool names alone.
