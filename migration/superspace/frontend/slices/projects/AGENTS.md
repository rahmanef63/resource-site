# Projects

## Purpose
Projects feature logic and capabilities.

## Entry Points
- config: `frontend/slices/projects/config.ts`
- page: `frontend/slices/projects/page.tsx`
- views: `frontend/slices/projects/views/*`
- hooks: `frontend/slices/projects/hooks/*`
- frontend agent: `frontend/slices/projects/agent/index.ts`
- backend agent: `convex/features/projects/agent.ts`
- settings: `frontend/slices/projects/settings/*`
- init: `frontend/slices/projects/init.ts`

## Required Shared Dependencies
- auth/foundation: `@/frontend/shared/foundation`
- settings infra: `@/frontend/shared/settings`
- permission helpers: `convex/auth/helpers` -> `requirePermission`
- permission constants: `convex/workspace/permissions` -> `PERMS`

## Rules
- NEVER hardcode permission strings — use `PERMS.XXX_VIEW`, `PERMS.XXX_MANAGE`
- ALL Convex mutations MUST call `requirePermission(ctx, workspaceId, PERMS.xxx)`
- ALL Convex queries MUST call `requireActiveMembership(ctx, workspaceId)`
- ALL mutations MUST include audit logging via `logAuditEvent`
- DO NOT bypass the registry/generator pipeline
- DO NOT import directly from other features — use shared modules

## Validation
- `pnpm run sync:all`
- `pnpm run validate:features`
- `pnpm run validate:permissions`
- `pnpm run validate:audit`
