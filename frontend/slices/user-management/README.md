
## SvelteKit distribution

React/Next remains the default. For native Svelte 5/SvelteKit use:

```bash
npx rr add user-management --framework sveltekit
```

The Svelte renderer covers Members, hierarchy-aware Invites, Roles, Teams, and Access Matrix over the same canonical types, permission checks, member-view core, agent tools, peer slices, and `convex/features/user_management` backend. Backend authorization remains authoritative; `currentPerms` only gates presentation.
