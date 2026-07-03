# Changelog — admin-console

## 0.1.0 — 2026-07-02

- Initial release. Composition admin panel harvested from ~15 project admin
  panels (docs/admin-panel/COMPARISON.md + DESIGN.md).
- `ADMIN_CONSOLE_SECTIONS`: 26-section catalog across observability / identity /
  ai / content / commerce / config, each tagged with its provider rr slice or
  `"self"`.
- `AdminConsole` gated two-column shell — nav filtered by injected access + tier
  + permission; URL-synced active section via History API; reuse sections
  mounted from a consumer-supplied `components` map (no slice→slice imports).
- 5 owned gap sections, adapter-driven with in-memory mocks: `AnalyticsDashboard`,
  `AuditLogViewer` (filter + diff drawer), `NavConfigManager` (reorder + toggle),
  `LeadsInbox` (status pipeline + notes drawer), `SeoHealthPanel` (per-page score).
- `AdminConsole` optional `headerSlot` prop — a node in the section header row
  (e.g. a notifications bell) with no peer dependency.
- Pure gate logic (`lib/access.ts`) + unit tests (`lib/access.test.ts`);
  `useAdminSection` URL-sync tests (`hooks/useAdminSection.test.tsx`).
- README wiring recipes for the owned Leads + Navigation sections over the
  `ac_leads` / `ac_nav_items` Convex backend.
- Convex copy-source: `ac_leads` + `ac_nav_items` with `requireAdmin`-gated
  queries/mutations; `ac_leads.create` public for contact-form ingestion
  (length-guarded, pair with the rate-limit slice).
