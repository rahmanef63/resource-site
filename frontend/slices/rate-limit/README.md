# rate-limit

Convex-backed per-key request counter. Drop-in replacement for an in-memory
`Map` so a Next.js app can run multiple replicas without each replica owning
its own bucket. Atomic check-and-increment via a single Convex mutation;
expired rows pruned by cron.

## Props / surface

No React surface — service slice only. Public API is the Convex mutation
`consume` and the internal cron `_pruneExpired`. Recommended consumer entry
point is a thin lib wrapper with a fail-open fallback (see [Integration]).

| Convex fn | Args | Returns | Notes |
|---|---|---|---|
| `consume` (mutation) | `{ key: string, limit: number, windowMs: number }` | `{ ok, remaining, resetAt }` | Atomic — Convex serialises mutations against the same row. |
| `_pruneExpired` (internalMutation) | `{}` | `{ deleted: number }` | Walks expired rows in batches of 1000; wire to a cron. |

## Convex tables

| Table | Purpose |
|---|---|
| `rateLimits` | One row per `(key)`. Stores `count` + `resetAt`. Indexed `by_key` for lookup and `by_resetAt` for pruning. |

## Permissions

None. Rate-limit is invoked from unauthenticated API routes before any
identity is resolved — keying happens by caller-defined namespace (e.g.
`csp:<ip>`, `mcp:<ip>`, `oauth_token:<ip>`).

## Dependencies

- npm: `convex` (peer; provided by host app)
- kitab slices: none
- shadcn primitives: none
- env vars: none

## Integration

```ts
// consumer lib wrapper — fail-open on Convex flap
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  try {
    return await fetchMutation(api.slices.rate_limit.consume, { key, limit, windowMs });
  } catch {
    // Fail open — do not DoS callers when Convex is unreachable.
    return { ok: true, remaining: 0, resetAt: Date.now() + windowMs };
  }
}
```

Wire the cron in `convex/crons.ts`:

```ts
crons.interval(
  "rate-limit: prune expired",
  { minutes: 5 },
  (internal as any)["slices/rate_limit"]._pruneExpired,
);
```

## Origin

Harvested from `rahmanef.com` on `2026-05-15`. Source path:
`frontend/slices/rate-limit/`. Born to replace the in-memory `Map` at
`frontend/shared/lib/rate-limit.ts` after the project went multi-replica.
