# Crm

## Purpose
Crm feature logic and capabilities.

## Entry Points
- config: `frontend/slices/crm/config.ts`
- page: `frontend/slices/crm/page.tsx`
- views: `frontend/slices/crm/views/*`
- hooks: `frontend/slices/crm/hooks/*`
- frontend agent: `frontend/slices/crm/agent/index.ts`
- backend agent: `convex/features/crm/agent.ts`
- settings: `frontend/slices/crm/settings/*`
- init: `frontend/slices/crm/init.ts`

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
