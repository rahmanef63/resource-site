# testimonials

**Testimonials**

Quote/name/role rotator backend. Public `listAll` + `get` queries (no auth — testimonials are public), admin `create` / `update` / `remove`, internal `seed` for one-shot bootstrap. Indexed by `order` so the carousel/grid keeps stable rotation. Lifted 2026-05-16 from rahmanef.com; sanitized: token-based admin gate swapped for `requireAdmin(ctx)` ...

## Install

```bash
npx rr add testimonials
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/testimonials/`](../../../convex/features/testimonials/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
