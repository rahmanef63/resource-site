# telemetry slice

Privacy-preserving telemetry receiver for kitab slice usage.

## Purpose

Consumers (apps that adopted kitab slices) optionally report anonymized
events: which slices are in use, audit-bp pass/fail, drift, removal. The
kitab aggregates these to compute a "quality score" per slice and surface
it on `/quality`. Closed feedback loop — no PII leaks.

## Tables (`telemetryTables`)

| Table | Purpose |
|---|---|
| `telemetry_events` | Raw events. Indexed by slug and by `(consumer_hash, received_at)` for rate-limit lookups. |
| `telemetry_aggregates` | Pre-computed daily roll-ups per slice. Indexed by `(slug, date)`. Populate via a scheduled job. |

## Privacy model

- **`consumer_hash`** is `sha256(consumerName + UTC day)` — rotates daily,
  so even a single consumer cannot be re-identified across days from the
  hash alone.
- **No PII**: no IP, no User-Agent, no consumer name, no project ID.
- **Payload cap**: at most 1 KB per event. Anything bigger is rejected.
- **Retention**: 30 days. Cleanup is the consumer's responsibility — wire
  a Convex scheduled job that deletes rows where `received_at < now() - 30d`.

## Public functions

| Function | Kind | Args validator |
|---|---|---|
| `telemetry.mutations.recordEvent` | mutation | `{ slug, event_type, consumer_hash, payload? }` |
| `telemetry.queries.getSliceStats` | query | `{ slug }` |

Both have full `args:` validators (audit-bp P0 compliant).

## Rate limiting

`recordEvent` rejects with `rate_limited` if a `consumer_hash` has already
submitted 60 events in the trailing hour. The check uses the
`by_consumer_hour` index, so the lookup stays O(window) regardless of
table size.

## Consumer opt-in

Telemetry is **off by default**. The consumer must set:

```
RAHMAN_RESOURCES_TELEMETRY=1
```

…before any event is fired. See `docs/quality-scoring.md` for full wiring.
