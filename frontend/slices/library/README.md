# library

Grab-bag resource hub — one polymorphic table holds six item kinds (`prompt`, `image`, `video`, `link`, `download`, `snippet`) with per-kind payload fields switched on `kind`. Attribution-first; collections group items. Public surface = filterable card grid + per-item detail.

## Wire surface

- **Index view** — `<LibraryIndex items copy kindLabels />`
- **Detail view** — `<LibraryDetail item onUpvote copy kindLabels />`
- **Convex schema extension** — `libraryTables` from `convex/features/library/_schema.ts`
- **Convex queries** — `listAll`, `listPublic`, `listByCollection`, `getBySlug`, `listFeatured`, `listCollections`, `getCollectionBySlug`
- **Convex mutations** — `create`, `update`, `remove`, `createCollection`, `updateCollection`, `removeCollection`, `seed` (all unauthenticated — consumer wraps)

## Peer

Requires the [`seo`](../seo) slice — the Convex schema + mutations reuse `seoFieldsShape` / `seoPatchShape` from `convex/features/seo/fields.ts`. Run `npx rr add seo` first.

## Install

```bash
npx rr add seo      # peer
npx rr add library
```

Then in your root Convex schema:

```ts
// convex/schema.ts
import { defineSchema } from "convex/server";
import { seoTables } from "./features/seo/_schema";
import { libraryTables } from "./features/library/_schema";

export default defineSchema({
  ...seoTables,
  ...libraryTables,
  // ...your other tables
});
```

Wrap the unauthenticated mutations with your auth model:

```ts
// convex/api/library.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "@/features/convex-auth/server/admin"; // or your own
import { itemContentShape } from "../features/library/_schema";
import { create as createInternal } from "../features/library/mutation";

export const create = mutation({
  args: { token: v.string(), ...itemContentShape },
  handler: async (ctx, { token, ...args }) => {
    await requireAdmin(ctx, token);
    return ctx.runMutation(createInternal, args);
  },
});
// repeat for update / remove / *Collection / seed
```

Mount the views:

```tsx
// app/library/page.tsx
import { LibraryIndex } from "@/features/library";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Page() {
  const items = await fetchQuery(api.api.library.listPublic, {});
  return <LibraryIndex items={items} />;
}
```

## Upvotes (opt-in)

`LibraryDetail` renders the count read-only unless you pass `onUpvote`. The vote backend is consumer-owned — wire it to whatever upvote store you use:

```tsx
<LibraryDetail
  item={item}
  onUpvote={async (id) => {
    const r = await fetch("/api/library/vote", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    return r.json() as Promise<{ voted: boolean }>;
  }}
/>
```

## Schema highlights

| Field | Notes |
|---|---|
| `kind` | `prompt` \| `image` \| `video` \| `link` \| `download` \| `snippet` — discriminator |
| `promptText` / `imageUrl` / `videoUrl` / `linkUrl` / `fileStorageId` / `snippetCode` | per-kind payload — `validatePayload` enforces the matching one on create |
| `collectionId` | optional group via `libraryCollections` |
| `sourceName` / `sourceUrl` / `license` / `tools` | attribution surface |
| `published` / `deletedAt` | soft-publish + soft-delete; reads filter both |
| `upvotes` / `views` | cached counters (vote toggle is consumer-owned) |
| SEO fields | reused from the `seo` peer (`seoFieldsShape`) |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` (Index) | `LibraryRow[]` | required | from `listPublic` |
| `item` (Detail) | `LibraryItem` | required | from `getBySlug` |
| `onUpvote` (Detail) | `(id) => Promise<{ voted }>` | — | omit for read-only count |
| `copy` | `Partial<LibraryCopy>` | English defaults | all user-facing strings |
| `kindLabels` | `Partial<Record<string,string>>` | English defaults | per-kind display labels |

## Module layout

| Path | Purpose |
|---|---|
| `views/LibraryIndex.tsx` | Filterable card grid (kind + tool filters). |
| `views/LibraryDetail.tsx` | Single item — header, payload, attribution footer. |
| `components/PayloadRender.tsx` | `kind` switch — embeds, code/prompt blocks, download/link buttons. |
| `components/CopyButton.tsx` | Clipboard copy with transient state (no toast dep). |
| `components/UpvotePanel.tsx` | Opt-in upvote control (consumer supplies handler). |
| `lib/types.ts` | `LibraryRow`, `LibraryItem`, `LibraryCopy`, props. |
| `lib/defaults.ts` | `DEFAULT_COPY` (English) + `DEFAULT_KIND_LABELS` + `ALL_KINDS`. |
| `convex/features/library/_schema.ts` | `libraryTables` + reusable shape exports. |
| `convex/features/library/query.ts` | seven reads — all index-bounded + capped. |
| `convex/features/library/mutation.ts` | CRUD + generic `seed` — unauthenticated. |

## Origin

Lifted from `rahmanef.com` on `2026-05-28`. The 432-LOC `mutations.ts` + 330-LOC `LibraryDetail.tsx` were split for the 200-LOC cap (mutations factored shared validator shapes into `_schema.ts`; detail split into `PayloadRender` + `UpvotePanel` + `CopyButton`). Indonesian copy + custom `<Section>`/`<Heading>`/`<Badge>` primitives + brutalist utilities (`tracking-brutal-sm`, `shadow-brutal`, `border-foreground`) stripped — replaced with prop-driven English defaults + raw semantic elements + stock utilities. Cross-slice `requireAdmin` import dropped (mutations now `internalMutation`; consumer wraps). The project-specific `toggleVote` mutation (which wrote to the `comments` slice's `votes` table) + the Indonesian `seedDefaults` data were dropped — vote persistence is now an `onUpvote` prop and `seed` accepts arbitrary items. SEO fields reused from the `seo` peer instead of being inlined.
