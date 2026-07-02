# Tasks

## Purpose
Tasks feature logic and capabilities.

## Entry Points
- config: `frontend/slices/tasks/config.ts`
- page: `frontend/slices/tasks/page.tsx`
- views: `frontend/slices/tasks/views/*`
- hooks: `frontend/slices/tasks/hooks/*`
- frontend agent: `frontend/slices/tasks/agent/index.ts`
- backend agent: `convex/features/tasks/agent.ts`
- settings: `frontend/slices/tasks/settings/*`
- init: `frontend/slices/tasks/init.ts`

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
