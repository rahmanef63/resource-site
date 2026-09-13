# services

Backend-only service-offerings data contract: public `listAll` / `get`, admin `create` / `update` / `remove`, and an internal one-shot `seed`. Pair it with the UI framework of your choice.

## Install

React/Next remains the default distribution contract:

```bash
npx rr add services
```

The same framework-neutral source is available explicitly to Svelte/SvelteKit consumers:

```bash
npx rr add services --framework sveltekit
```

No React or Svelte runtime package is required by this backend-only slice.

## Use

- Public TypeScript exports: [`./index.ts`](./index.ts)
- Convex schema, queries, and mutations: [`convex/features/services/`](../../../convex/features/services/)
- Canonical dependencies, environment guidance, RBAC, and framework distribution metadata: [`./slice.json`](./slice.json)

Compose `servicesTables` into the host schema. Read through `features.services.query.listAll` / `get`; mutations `create`, `update`, and `remove` enforce `requireAdmin(ctx)`. `seed` is internal-only.

## Security and bounds

- Public reads are intentional content reads; `listAll` is bounded to 500 rows and ordered by the `by_order` index.
- Admin mutations authorize server-side with `requireAdmin(ctx)`.
- `seed` is an `internalMutation`, so it is not a public client endpoint.
- `SUPER_ADMIN_EMAIL` is optional host configuration; secrets do not belong in slice metadata or docs.
