# html-studio changelog

## 1.1.0 — 2026-09-13

- Moved document types, mock/live adapter, device/view helpers, starter doc, share/payload helpers and the exact iframe sandbox contract into one framework-neutral `lib/core.ts`.
- React/Next remains the default Lucide + shadcn renderer and preserves `HtmlStudio`, `htmlStudioApp`, `configureHtmlStudio` and `useHtmlStudioApi`.
- Added native Svelte 5/SvelteKit Code/Split/Preview UI with 250ms live `srcdoc`, device-width cycling, saved-page CRUD, visibility and copy-link flow over the same core.
- Security invariant remains exact: `HTML_SANDBOX` omits `allow-same-origin`, keeping arbitrary preview code in an opaque origin.

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `HtmlStudioAdapter` (save / load / list / remove)
  with an in-memory mock so the editor, the live sandboxed iframe preview, and
  the saved-pages rail are all interactive with zero backend. The Convex page
  store + auth/write-key/session bits were dropped in favour of the adapter.
  The iframe isolation is preserved exactly (`sandbox="allow-scripts …"`
  WITHOUT `allow-same-origin` → opaque origin). Brand-stripped to a generic
  HTML studio.
