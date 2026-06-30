# resume changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS) and brand-stripped to a generic,
  data-injected CV renderer. The component reads a single `ResumeProfile` from
  the host seam (`lib/host.ts`): call `configureResume(profile)` at boot to feed
  your own data (Convex, CMS, JSON), or keep the bundled generic placeholder
  person so the catalog preview renders fully populated with zero backend.
  Added a "Print / PDF" button (`window.print()`) with a print-friendly layout.
