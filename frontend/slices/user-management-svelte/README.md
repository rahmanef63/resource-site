# user-management — Svelte 5 / SvelteKit

Native Svelte distribution for the canonical `user-management` slice. It preserves Members, pending invites + hierarchy propagation, Roles + permission editing, Teams, and the cross-tenant Access Matrix while reusing the same framework-neutral types, permission checks, members view derivation, tools, and Convex backend as the React default.

```bash
npx rr add user-management --framework sveltekit
```

The slice remains props-driven. Resolve `roles`, `currentPerms`, permission groups, and all CRUD callbacks in the host. Authorization must remain server-side in the bundled Convex functions; UI permission checks only control presentation.
