# rate-limit

Backend-only, framework-neutral Convex rate limiter. It replaces a per-process `Map` with one shared bucket table so multiple app replicas observe the same counters.

React/Next remains the default distribution contract:

```bash
npx rr add rate-limit
```

Svelte/SvelteKit installs the exact same TypeScript + Convex source—there is no UI to duplicate and no Svelte runtime dependency:

```bash
npx rr add rate-limit --framework sveltekit
```

## Runtime contract

| Convex fn | Args | Returns | Notes |
|---|---|---|---|
| `features/rate_limit/mutation.consume` | `{ key, serverKey? }` | `{ ok, remaining, resetAt }` | Atomic check-and-increment. Policy is selected by the key prefix and remains server-owned. |
| `features/rate_limit/mutation._pruneExpired` | `{}` | `{ deleted }` | Internal mutation; prune expired rows on a bounded cron. |

The policy map lives in `convex/features/rate_limit/mutation.ts`. Unknown prefixes are rejected. Do not let callers supply their own `limit` or `windowMs` because that would let them weaken policy.

`RATE_LIMIT_SERVER_KEY` is optional but recommended for user-facing or security-sensitive namespaces. When configured in Convex, `consume` requires the matching server-side key; when omitted, the mutation logs a warning and remains callable without that extra gate.

## Schema

Compose the shipped table fragment into the consumer schema:

```ts
import { defineSchema } from "convex/server";
import { rateLimitTables } from "./features/rate_limit/_schema";

export default defineSchema({
  ...rateLimitTables,
});
```

`rateLimits` stores one row per key with `count` and `resetAt`, indexed by `key` and `resetAt`.

## Server-side wrapper

Keep network failure behavior explicit at the application boundary. A typical fail-open wrapper is:

```ts
import { fetchMutation } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function rateLimit(key: string) {
  try {
    return await fetchMutation(api.features.rate_limit.mutation.consume, {
      key,
      serverKey: process.env.RATE_LIMIT_SERVER_KEY,
    });
  } catch {
    return { ok: true, remaining: 0, resetAt: Date.now() + 60_000 };
  }
}
```

Whether fail-open is appropriate is a host policy decision. Security-sensitive boundaries may intentionally fail closed instead.

## Cron

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "rate-limit: prune expired",
  { minutes: 5 },
  internal.features.rate_limit.mutation._pruneExpired,
  {},
);
export default crons;
```

## Agent tools

`rate-limit.check` is read-only. `rate-limit.reset` is marked dangerous and must be bound to an admin-gated reset implementation; confirm before clearing a live bucket.

The slice requires Convex but no React, Svelte, Lucide, or shadcn runtime/UI dependency.
