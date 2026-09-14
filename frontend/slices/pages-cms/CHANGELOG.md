# Changelog — pages-cms

## 0.2.0 — 2026-09-15

- Added native Svelte 5 / SvelteKit distribution with PagesView, PageEditorView, all 11 block editors, public block renderers, PagesProvider, and LocalPagesProvider.
- Shared reducer/types/default seed/page factories/nav helpers remain the single source of truth across React and Svelte.
- Fixed clean-install React portability: removed `next/link`, `next/image`, `@/lib/utils`, and repo-only `defineFeature` dependencies.
- Fixed editor draft semantics: block reorder now stays local until Save, so unsaved block edits are not overwritten by an immediate store reorder.
- Added an editable snapshot helper so Save returns to a clean state even when the store updates `updatedAt`.

## 0.1.0 — 2026-06-19

- Initial release. Generalized from the `saas-marketing` pages engine into a
  standalone, self-contained slice (P4b).
- 11 block kinds: hero, text, feature-list, cta, logo-cloud, testimonial,
  video, image-gallery, faq, stats, pricing-table.
- Admin surfaces: `PagesView` (list + CRUD), `PageEditorView` (metadata +
  block editor), `PageCreateDialog`, per-block forms.
- Public render: `BlockRenderer` / `BlocksRenderer`.
- Store: `PagesProvider` / `usePagesStore` / `usePage` + `pagesReducer`, plus
  `LocalPagesProvider` (localStorage adapter) and `defaultPages()` generic
  Home/About/Pricing seed for an env-free demo.
- Severed every external coupling from the source engine: dropped the
  landing/section bridge (`PageSectionsEditor`, `sections[]`, section
  reducer cases), the admin-shell `nav-builder` types (now shell-agnostic
  `buildPageNavItems`), and all `@/components/templates/_shared/*` imports.
  Survives the deletion of `components/templates/*`.
