# Changelog — settings-page

## 1.1.0 — 2026-08-03

- `SettingsShell` optional `nav` prop (default `true` — unchanged two-column
  layout). `nav={false}` renders the active panel ONLY (no desktop rail, no
  mobile `Select`), for hosts whose app sidebar already lists the sections.
- `lib/nav.ts`: `SETTINGS_SECTIONS` catalog (moved out of `SettingsShell.tsx`,
  which re-exports `SettingsSectionId` from its old source path) +
  `settingsSectionsToNav(onSelect, { activeId, dockCount, sections, groupLabel })`
  → one plain nav group structurally matching the `dashboard-shell` slice's
  `nav` prop. No slice→slice import; unit tests in `lib/nav.test.ts`.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `settingsPageTools` — get/set over the live useSettings() result (optimistic save + rollback preserved).
