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
| `consume` (mutation) | `{ key: string, serverKey?: string }` | `{ ok, remaining, resetAt }` | Atomic — Convex serialises mutations against the same row. Limit + window come from the in-code `POLICY` map keyed by the key's prefix (everything before the first `:`); unknown prefixes throw. |
| `_pruneExpired` (internalMutation) | `{}` | `{ deleted: number }` | Walks expired rows in batches of 1000; wire to a cron. |

> **Why no `limit`/`windowMs` args?** `consume` is a public mutation —
> anything the caller can pass, an attacker can pass. Caller-supplied
> windows let an anonymous caller "consume" with a huge window and bypass
> the limit entirely. Edit the `POLICY` map in `mutation.ts` to add
> namespaces.

## Convex tables

| Table | Purpose |
|---|---|
| `rateLimits` | One row per `(key)`. Stores `count` + `resetAt`. Indexed `by_key` for lookup and `by_resetAt` for pruning. |

## Permissions

Rate-limit is invoked from unauthenticated API routes before any identity
is resolved — keying happens by namespace prefix (e.g. `admin-login:<ip>`,
`mcp:<ip>`). Two abuse vectors and their mitigations:

- **Forged window** — closed unconditionally: limits live in the in-code
  `POLICY` map, not the args.
- **Burning a victim's budget** (calling `consume` with someone else's
  key) — closed when you set the `RATE_LIMIT_SERVER_KEY` env on the Convex
  deployment. When set, `consume` requires a matching `serverKey` arg
  (compared constant-time); pass it from your server-side wrapper. Without
  the env, `consume` accepts anonymous calls — fine for low-stakes keys,
  set it for anything user-facing.

## Dependencies

- npm: `convex` (peer; provided by host app)
- kitab slices: none
- shadcn primitives: none
- env vars: `RATE_LIMIT_SERVER_KEY` (optional but recommended — see Permissions)

## Integration

```ts
// consumer lib wrapper — fail-open on Convex flap
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function rateLimit(key: string) {
  try {
    return await fetchMutation(api.slices.rate_limit.consume, {
      key,
      serverKey: process.env.RATE_LIMIT_SERVER_KEY,
    });
  } catch {
    // Fail open — do not DoS callers when Convex is unreachable.
    return { ok: true, remaining: 0, resetAt: Date.now() + 60_000 };
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
