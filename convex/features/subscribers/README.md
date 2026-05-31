# subscribers (convex feature)

Newsletter / waitlist signups. Records confirmed subscribers and tracks raw
attempts (for rate-limiting + abuse detection).

**Tables:** `subscribers`, `subscriberAttempts`
**Functions:** `query.ts`, `mutation.ts`

Schema composes into the root via `subscribersTables` in `_schema.ts`.
Part of Rahman Resources.
