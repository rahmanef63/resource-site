# Slice Quality Scoring

Phase F of the Slice Composition Compiler. Closes the feedback loop:
consumers anonymously report slice usage / audit results → the kitab
computes per-slice quality scores → the `/admin/quality` page surfaces them.

> The dashboard moved from public `/quality` to `/admin/quality` (operator-only)
> on 2026-05-16 — consumer adoption telemetry is internal intel, not public docs.

## Pieces

| Piece | Where |
|---|---|
| Telemetry receiver | `convex/features/telemetry/` (`telemetryTables`, `recordEvent`, `getSliceStats`) |
| Scoring fn | `lib/telemetry/score.ts` (`computeQuality`, `computeQualityBars`) |
| Score tests | `lib/telemetry/score.test.ts` (6 vitest cases) |
| Dashboard | `app/admin/quality/page.tsx` → route `/admin/quality` (auth-gated) |
| Sidebar nav | `components/admin/admin-shell.tsx` `INSPECT_NAV` |

## Scoring formula

```
overall = audit  * 0.40
        + usage  * 0.30   // log10(count+1)/log10(101) * 100
        + (100 - drift) * 0.30
```

- **audit** — raw audit-bp score, 0-100. Higher is better.
- **usage** — raw count of distinct consumers, log-saturated so that 100+
  consumers all map to ~100. Avoids over-rewarding mega-popular slices.
- **drift** — 0..100 average drift across consumers. Inverted in the formula
  (0 drift contributes a perfect 30, 100 drift contributes 0).

Inputs are clamped to `[0, 100]` (count is clamped to `≥ 0`).
NaN / non-finite inputs are coerced to 0.

### Bands

```
band = A  if overall ≥ 90
       B  if overall ≥ 80
       C  if overall ≥ 70
       D  if overall ≥ 60
       F  otherwise
```

### Worked examples

| audit | usage | drift | overall | band |
|--:|--:|--:|--:|:--:|
| 100 | 100 | 0   | 100 | A |
| 90  |  20 | 10  |  76 | C |
| 75  |   5 | 25  |  72 | C |
| 60  |   1 | 40  |  51 | F |
| 20  |   0 | 80  |  14 | F |

(Values rounded; see `lib/telemetry/score.test.ts` for the asserted cases.)

## Privacy model

The receiver MUST NEVER ingest anything that could re-identify a consumer.
Fields stored in `telemetry_events`:

| Field | Privacy |
|---|---|
| `slug` | Public slice slug — non-sensitive |
| `event_type` | enum (`adopt` \| `audit_pass` \| `audit_fail` \| `remove` \| `drift`) |
| `consumer_hash` | `sha256(consumerName + UTC-day)` — rotates daily |
| `payload` | Optional, capped at 1 KB. Free-form JSON string; consumers MUST omit any PII before sending. |
| `received_at` | Server-side `Date.now()` |

What is NOT stored: IP, User-Agent, project ID, user email, raw consumer
name, geo, repo URL.

### Retention

30 days. The query window `getSliceStats` already filters by
`received_at >= now() - 30d`, but consumers should wire a Convex
scheduled job to physically delete older rows.

### Rate limit

`recordEvent` rejects with `rate_limited` after 60 events / hour per
`consumer_hash`. The check uses the `by_consumer_hour` index so it stays
fast at scale.

## Consumer opt-in

Telemetry is **off by default**. Two-step opt-in:

1. The consumer sets the env var:

   ```bash
   RAHMAN_RESOURCES_TELEMETRY=1
   ```

2. Wherever the consumer wants to emit (typically: post-install,
   post-audit, on slice removal), call the mutation:

   ```ts
   import { api } from "@convex/_generated/api";
   import { createHash } from "node:crypto";

   if (process.env.RAHMAN_RESOURCES_TELEMETRY === "1") {
     const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
     const consumer_hash = createHash("sha256")
       .update(`${process.env.npm_package_name}|${today}`)
       .digest("hex");
     await client.mutation(api.features.telemetry.mutations.recordEvent, {
       slug: "doku-payment",
       event_type: "adopt",
       consumer_hash,
       // payload optional, ≤ 1 KB
     });
   }
   ```

Operators who want to silence the receiver entirely can leave the slice
out of `convex/schema.ts` — there are no other consumers of
`telemetryTables`.

## TODO — live integration

The dashboard at `/admin/quality` currently uses deterministic placeholder
inputs keyed off the slice slug (see `mockInputsForSlug` in the page).
Switch to live data once:

1. The receiver slice is composed into the kitab's own Convex deployment.
2. At least one downstream consumer has shipped a build with telemetry on.
3. `getSliceStats` returns non-empty results for the top ~5 slices.

The integration point is `mockInputsForSlug` → fan-out
`getSliceStats({ slug })` in a Server Component, with a `useCacheLife`
of a few minutes (Next 16 `cacheComponents`).
