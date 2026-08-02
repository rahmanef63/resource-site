# pages-cms

A small, self-contained **multi-page CMS**: list, create, edit, duplicate,
and publish pages composed from reusable **blocks**. Pure UI — runs on a
bundled localStorage adapter with zero backend, or wire the reducer +
store context to your own persistence.

> Generalized from the `saas-marketing` pages engine. No template, CRUD,
> or landing-section coupling — `blocks[]` is the only composition
> primitive, so the slice survives independently.

## Surface

| Export | Kind | Notes |
|---|---|---|
| `PagesView` | component | Admin list — system + custom pages, row actions (View / Edit / Duplicate / Delete). Props: `publicBase`, `adminBase`. |
| `PageEditorView` | component | Metadata form + block editor for one page. Props: `id`, `publicBase`, `adminBase`. |
| `PageEditorBlocks` | component | The block list editor (add / reorder / patch / remove). Used by `PageEditorView`. |
| `BlockEditor` | component | Per-block form (switches on `block.kind`). |
| `BlockRenderer` / `BlocksRenderer` | component | Read-only public render of a block / block list. |
| `PageCreateDialog` | component | Slug + title dialog for New / Duplicate. |
| `PagesProvider` / `usePagesStore` / `usePage` | store | Store context. Supply your own `PagesStore` value… |
| `LocalPagesProvider` | store | …or use this localStorage-backed provider (`seed`, `storageKey` props). |
| `pagesReducer` | util | Pure reducer over `PagesAction`. Mount in your own store. |
| `duplicatePage` / `blankPage` | util | Page factories. |
| `buildPageNavItems` | util | Shell-agnostic sidebar nav items from `pages[]`. |
| `defaultPages` | util | Generic Home / About / Pricing seed. |
| `emptyBlock` / `PAGE_BLOCK_KINDS` / `BLOCK_KIND_LABEL` | util | Block helpers. |

## Block kinds (11)

`hero` · `text` · `feature-list` · `cta` · `logo-cloud` · `testimonial` ·
`video` · `image-gallery` · `faq` · `stats` · `pricing-table`

## Quick start (localStorage, zero backend)

```tsx
"use client";
import { LocalPagesProvider, PagesView, defaultPages } from "@/features/pages-cms";

export default function AdminPages() {
  return (
    <LocalPagesProvider seed={defaultPages()}>
      <PagesView publicBase="/p" adminBase="/admin" />
    </LocalPagesProvider>
  );
}
```

The editor route (`/admin/pages/[id]`) renders `<PageEditorView id={id} …/>`
inside the same provider. The public catch-all (`/p/[...slug]`) looks up the
page by slug and renders `<BlocksRenderer blocks={page.blocks} />`.

## Wiring to your own backend

Skip `LocalPagesProvider`. Build a `PagesStore` value from your own
dispatch (Convex mutation, server action, etc.) and pass it to
`PagesProvider`. `pagesReducer` is the same pure reducer the local store
uses, so you can reuse it server-side or client-side.

## Install

```bash
npx rahman-resources add pages-cms
```

Files copy to `slices/pages-cms/` — you own them. Edit Tailwind / theme
tokens / block kinds freely.
