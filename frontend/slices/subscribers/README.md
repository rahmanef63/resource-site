# subscribers

**Subscribers**

Newsletter list with public `subscribe` (honeypot + per-email rate-limit + idempotent on email) + token-based `unsubscribe` + admin `remove` + admin queries `listAll` / `count`. Schema includes a `subscriberAttempts` throttle table. Lifted 2026-05-16 from rahmanef.com; sanitized: token-based admin gate replaced with rr's `requireAdmin(ctx)` from...

## Install

```bash
npx rr add subscribers
```

## Use

- Frontend exports — see [`./index.ts`](./index.ts)
- Convex schema + queries + mutations — see [`convex/features/subscribers/`](../../../convex/features/subscribers/)
- Dep peers + env + RBAC scopes — see [`./slice.contract.ts`](./slice.contract.ts)

## Constraints (rr conventions)

Follows the full rr rule set — see [`frontend/slices/_templates/example-feature/README.md`](../_templates/example-feature/README.md) for the canonical list. Key gates:
- shadcn primitives only (`audit:templates`)
- ≤200 LOC per file (`audit:file-size`)
- Metadata trio: `slice.json` + `slice.contract.ts` + `slice.manifest.json` (`audit:slices`)
- Convex public fn require `args:` validator + auth gate

Run `npm run slices:check` before commit; pre-push hook re-runs the chain.
