# admin

**Admin — Generic Shell**

Per-instance admin landing scaffold + portable nav-from-registry factory. Consumer supplies a SliceRegistryAdapter (each slice declares its own admin.activity[]) and a queryTable reader; the slice's buildAdminStats(opts) emits the { counts, unreadMessages, activity } shape Convex's admin.stats query returns. Pure UI/factory — no Convex tables ow...

## Install

```bash
npx rr add admin
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/admin/`](../../../convex/features/admin/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
