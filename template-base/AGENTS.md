# SuperSpace AI Coding Guidelines

Welcome to the SuperSpace repo! As an AI coding assistant, you must adhere strictly to these architectural guidelines. This guarantees consistency, limits tech debt, and ensures that features plug seamlessly into the broader ecosystem.

## 1. Zero Hardcoding Policy
We never hardcode feature configurations, routing, or permission scopes. 
- Features are auto-discovered via their `config.ts` files inside `frontend/slices/<slug>/config.ts`.
- If you need a list of features, import it from `frontend/shared/lib/features/registry.ts` (auto-generated).

## 2. SSOT: config.ts
The single source of truth for any feature is its `config.ts`. This configuration drives the frontend navigation, backend API routing, workspace bundles, and AI agent capabilities.

## 3. Strict RBAC (Role-Based Access Control)
Security in SuperSpace is strictly enforced at the data layer.
- **NEVER** use string literals for permissions. Always use `PERMS.*` imported from `convex/workspace/permissions.ts`.
- **ALL Convex Mutations** must begin with `await requirePermission(ctx, args.workspaceId, PERMS.YOUR_PERMISSION)`.
- **ALL Convex Queries** must begin with `await requireActiveMembership(ctx, args.workspaceId)`.

## 4. Mandatory Audit Logging
Accountability is a core feature.
- **ALL Convex Mutations** must call `logAuditEvent` with details of what was modified, ensuring complete traceability.

## 5. Agent Conventions
SuperSpace has built-in AI agents that execute tools on behalf of features.
- Frontend Agent: Located at `frontend/slices/<slug>/agent/index.ts` (Note: singular `agent/`, not plural).
- Backend Agent: Located at `convex/features/<slug>/agent.ts` (Note: single file, not a directory).

## 6. Shared Infrastructure Over Feature Silos
Do not duplicate logic for settings, UI structures, or generic forms.
- Use `@/frontend/shared/settings` for settings UI.
- Use `@/frontend/shared/foundation` for core auth/system contexts.
- Use `@/frontend/shared/ui` for standardized inputs, feature headers, and layouts.

## 7. Validation Commands
After generating code or modifying a feature, always run:
- `pnpm run sync:all`
- `pnpm run validate:features`
