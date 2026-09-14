# pages-cms

A self-contained multi-page CMS for pages composed from reusable blocks. It ships admin CRUD, a block editor, public renderers, a localStorage adapter, and framework-neutral reducer/types/helpers.

## Frameworks

React/Next remains the default distribution:

```bash
npx rr add pages-cms
```

Svelte 5 / SvelteKit:

```bash
npx rr add pages-cms --framework sveltekit
```

Both distributions share the same `PageEntry`, `PageBlock`, reducer, default seed, duplicate/blank helpers, nav builder, block ordering, and editable-page snapshot semantics. The Svelte distribution depends only on `svelte@^5`; it does not copy React, Next, Lucide, or shadcn runtime code.

## Surface

| Export | Purpose |
|---|---|
| `PagesView` | Admin page list: View / Edit / Duplicate / Delete. |
| `PageEditorView` | Metadata + ordered block editor. |
| `PageEditorBlocks` | Add, reorder, patch, and remove blocks. |
| `BlockEditor` | Editor for all 11 block kinds. |
| `BlockRenderer` / `BlocksRenderer` | Read-only public rendering. |
| `PageCreateDialog` | New / duplicate slug + title flow. |
| `PagesProvider` | Adapter-driven host store. |
| `LocalPagesProvider` | localStorage-backed zero-backend store. |
| `pagesReducer` | Framework-neutral state reducer. |
| `defaultPages()` | Generic Home / About / Pricing seed. |
| `blankPage()` / `duplicatePage()` | Page factories. |
| `buildPageNavItems()` | Shell-neutral derived admin navigation. |

## Block kinds

`hero`, `text`, `feature-list`, `cta`, `logo-cloud`, `testimonial`, `video`, `image-gallery`, `faq`, `stats`, `pricing-table`.

## React quick start

```tsx
import { LocalPagesProvider, PagesView, defaultPages } from "@/features/pages-cms";

export default function AdminPages() {
  return (
    <LocalPagesProvider seed={defaultPages()}>
      <PagesView publicBase="/p" adminBase="/admin" />
    </LocalPagesProvider>
  );
}
```

## Svelte quick start

```svelte
<script lang="ts">
  import { LocalPagesProvider, PagesView, defaultPages } from "$lib/pages-cms";
</script>

<LocalPagesProvider seed={defaultPages()}>
  <PagesView publicBase="/p" adminBase="/admin" />
</LocalPagesProvider>
```

For your own persistence, provide a `PagesStore` through `PagesProvider`. Public routes look up a page by slug and render `BlocksRenderer` with `page.blocks`.

## Portability contract

`pages-cms@0.2.0` removes the former installed-source dependencies on `next/link`, `next/image`, `@/lib/utils`, and the repo-only `defineFeature` helper. The React copy is now closed over the declared Lucide + shadcn dependencies; the Svelte copy is renderer-native over the shared core.
