# about-profile changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): an injectable `AboutProfile` (name / roles / location /
  description / links / faq / avatarUrl) via `configureAbout`, with a generic
  mock person so the identity card — avatar/monogram, links and accordion FAQ —
  renders fully populated with zero backend. Brand-stripped: all person-specific
  identity replaced with a placeholder profile.
