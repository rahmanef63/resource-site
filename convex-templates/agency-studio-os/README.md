# Agency Studio OS — Convex slice

Drop-in backend for the Agency Studio OS template (T2).

## Tables

- `agencyProjects` — case studies (slug, client, category, status pipeline)
- `agencyClients` — current/prospect/alumni clients
- `agencyServices` — productized engagements
- `agencyLeads` — inbound briefs

## Wiring

1. Move `schema.ts` content into your `convex/schema.ts` (merge tables).
2. Move the modules to `convex/agency/{projects,clients,services,leads}.ts`.
3. Replace localStorage `StoreProvider` with Convex queries:
   - `useFeaturedProjects()` → `useQuery(api.agency.projects.featured)`
   - `useProject(slug)` → `useQuery(api.agency.projects.bySlug, { slug })`
   - `dispatch({ type: "lead.create", lead })` → `useMutation(api.agency.leads.create)`
4. Add `@convex-dev/auth` gate to `/admin/*` routes.
