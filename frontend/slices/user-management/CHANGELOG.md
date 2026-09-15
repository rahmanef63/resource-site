# Changelog — user-management

## 0.8.0 — 2026-09-15

- Added native Svelte 5/SvelteKit administration surfaces for Members, hierarchy-aware Invites, Roles, Teams, and Access Matrix while keeping React/Next as the default renderer.
- Extracted framework-neutral member filtering/sorting into `lib/members-core.ts`; both renderers reuse `can` / `matchPermission`, canonical data types, agent tools, and the same Convex backend.
- Corrected source metadata to `convex/features/user_management` and declared the existing React `lucide-react` dependency.
- Narrowed agent-tool imports to `agentic/define` + `agentic/schema`, avoiding accidental React hook leakage into Svelte installs.

## 0.7.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `userManagementTools` — 5 admin tools (list/invite/set_role/disable/remove) over an injectable server-gated `UserManagementCtx` (RBAC members.* enforced in the binding, never in the tool layer).
