# rate-limit (convex feature)

Server-side rate limiting — token-bucket counters keyed by action + identity.
Used to throttle newsletter signups, SEO generation, and other abuse-prone
mutations.

**Tables:** `rateLimits`
**Functions:** `mutation.ts`

Schema composes into the root via `rateLimitTables` in `_schema.ts`.
Part of Rahman Resources.
