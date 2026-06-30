# html-studio changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `HtmlStudioAdapter` (save / load / list / remove)
  with an in-memory mock so the editor, the live sandboxed iframe preview, and
  the saved-pages rail are all interactive with zero backend. The Convex page
  store + auth/write-key/session bits were dropped in favour of the adapter.
  The iframe isolation is preserved exactly (`sandbox="allow-scripts …"`
  WITHOUT `allow-same-origin` → opaque origin). Brand-stripped to a generic
  HTML studio.
