# convex/features/activity

Convex backend half of the [`activity`](../../../frontend/slices/activity) slice. Schema + queries + unauthenticated CRUD mutations.

## Files

| File | Purpose |
|---|---|
| `_schema.ts` | `activityTables` — extends the consumer's root Convex schema with the `activities` table + `by_occurredAt` + `by_visibility_occurredAt` indexes. Also exports `categoryUnion`, `sourceUnion`, `visibilityUnion` value validators for reuse. |
| `query.ts` | `listAll`, `listPublic`, `get`, `statsThisWeek` — public + admin reads. All capped + indexed (no bare `.collect()`). |
| `mutation.ts` | `create`, `update`, `remove`, `seed` — **unauthenticated** `internalMutation`s. Consumer MUST wrap these with an auth-gated public mutation (see slice README). |
| `index.ts` | Barrel re-exports `activityTables` + the three value unions. |

## Auth

The slice ships portable CRUD primitives. There is no auth check in this directory — the consumer chooses the auth model and wraps the `internalMutation`s with a public `mutation` that checks the bearer/OAuth/session first.

See the [slice README](../../../frontend/slices/activity/README.md#install) for the wrap pattern.
