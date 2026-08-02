# services

**Services**

Service offerings backend — title + summary + deliverables array + sort order. Public `listAll` + `get`, admin `create` / `update` / `remove`, internal `seed`. Pair with a frontend services grid/list. Lifted 2026-05-16 from rahmanef.com; token-based admin gate swapped for `requireAdmin(ctx)` from `_shared/auth`.

## Install

```bash
npx rr add services
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/services/`](../../../convex/features/services/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
