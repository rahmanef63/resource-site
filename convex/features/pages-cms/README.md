# pages-cms — Convex backend (OPTIONAL copy-source)

The `pages-cms` slice ships **pure-client** (localStorage) by default.
This dir is copy-source for consumers who want **server-side
persistence**. It is NOT composed into rr's own `convex/schema.ts`
(CLAUDE.md Hard Rule 6 — the library stays modular).

## Install

1. Copy `convex/features/pages-cms/` into your project.
2. Spread the table into your root schema:

   ```ts
   // convex/schema.ts
   import { defineSchema } from "convex/server";
   import { pagesCmsTables } from "./features/pages-cms/_schema";

   export default defineSchema({
     ...pagesCmsTables,
     // ...your other tables
   });
   ```

3. The CRUD primitives are `internalMutation`s — **wrap them in
   auth-gated public `mutation`s** before exposing to clients:

   ```ts
   // convex/pages.ts
   import { mutation } from "./_generated/server";
   import { internal } from "./_generated/api";
   import { pageContentShape } from "./features/pages-cms/_schema";

   export const createPage = mutation({
     args: pageContentShape,
     handler: async (ctx, args) => {
       await requireAdmin(ctx); // your authz
       return ctx.runMutation(internal.features.pages_cms.mutation.create, args);
     },
   });
   ```

4. Point the frontend at your queries/mutations instead of
   `LocalPagesProvider` by building a `PagesStore` value from your own
   dispatch and passing it to `<PagesProvider>`.

## Surface

| Export | Kind | Notes |
|---|---|---|
| `pagesCmsTables` | schema | `cmsPages` table (blocks stored as opaque JSON array). |
| `query.listAll` / `listPublished` / `getBySlug` / `getById` | query | Index-bounded, capped reads. |
| `mutation.create` / `update` / `reorderBlock` / `remove` / `seed` | internalMutation | Wrap with authz before exposing. |

Blocks are `v.array(v.any())` — the frontend `PageBlock` discriminated
union is the source of truth, so adding block kinds needs no Convex
schema change.
