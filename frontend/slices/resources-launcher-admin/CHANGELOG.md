# resources-launcher-admin changelog

## 1.0.0 — 2026-06-30

- Lifted from os-vps (the rahmanef-com web-OS). Self-contained host seam
  (`lib/host.ts`): injectable `ResourcesAdapter` (list / upsert / remove /
  canManage) with an in-memory mock so add / edit / remove / reorder are all
  interactive with zero backend. Convex `resources.*` mutations were replaced by
  the adapter, the auth/session/sign-in gating was dropped in favour of a simple
  `canManage` flag, and the launcher icon map was brand-stripped to generic
  lucide NAMEs. Renamed from "Resources Admin" to slug `resources-launcher-admin`
  to avoid colliding with the existing `quicklinks` / `files` slices.
