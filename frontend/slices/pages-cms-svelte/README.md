# Pages CMS — Svelte 5 / SvelteKit

Native Svelte distribution of `pages-cms`. It uses the same framework-neutral page types, reducer, duplicate/blank helpers, nav builder, default seed, and block semantics as the React distribution.

## Install

```bash
npx rr add pages-cms --framework sveltekit
```

The Svelte distribution depends only on `svelte@^5`. It does not copy React, Next, Lucide, or shadcn runtime code.

## Surfaces

- `PagesProvider` / `LocalPagesProvider`
- `PagesView`
- `PageEditorView` + `PageEditorBlocks` + `BlockEditor`
- `PageCreateDialog`
- `BlockRenderer` / `BlocksRenderer`
- shared `pagesReducer`, `defaultPages`, `blankPage`, `duplicatePage`, and `buildPageNavItems`

All 11 block kinds are editable and renderable: hero, text, feature-list, CTA, logo-cloud, testimonial, video, image-gallery, FAQ, stats, and pricing-table.
