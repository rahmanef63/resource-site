# convex/features/library

Convex backend half of the [`library`](../../../frontend/slices/library) slice. Schema + queries + unauthenticated CRUD mutations.

## Files

| File | Purpose |
|---|---|
| `_schema.ts` | `libraryTables` — extends the consumer's root schema with `libraryItems` (six indexes) + `libraryCollections`. Also exports `kindUnion` + the reusable `itemContentShape` / `itemPatchShape` / `collectionContentShape` / `collectionPatchShape` validators (consumed by `mutation.ts` and by the consumer's auth wrappers). SEO fields are spread from the `seo` peer's `seoFieldsShape`. |
| `query.ts` | `listAll`, `listPublic`, `listByCollection`, `getBySlug`, `listFeatured`, `listCollections`, `getCollectionBySlug` — all index-bounded + capped (no bare `.collect()`). |
| `mutation.ts` | `create`, `update`, `remove`, `createCollection`, `updateCollection`, `removeCollection`, `seed` — **unauthenticated** `internalMutation`s. Consumer MUST wrap with an auth-gated public `mutation`. |
| `index.ts` | Barrel re-exports `libraryTables` + `kindUnion` + the shape validators. |

## Peer

Imports `seoFieldsShape` / `seoPatchShape` from `../seo/fields`. Install the [`seo`](../seo) slice first (`npx rr add seo`).

## Auth

No auth check lives here — the slice ships portable CRUD primitives. The consumer chooses the auth model and wraps the `internalMutation`s with a public `mutation` that validates the bearer / OAuth / session first. See the [slice README](../../../frontend/slices/library/README.md#install).
