# Changelog — settings-page

## 0.3.0 — 2026-06-30

- Preferences section gains an auto-lock selector (Off / 1 / 5 / 15 min) writing a new `autoLockMinutes` preference (ported from the rahmanef-com web-OS settings panel). Stored through the existing adapter `save()` seam; the host owns the idle timer, the slice only persists the choice. Accent colour was intentionally NOT added here — the `shell-settings` slice already owns accent via its AppearanceAdapter; duplicating it would split the seam. Theme-preset engine, wallpaper picker, device/shell pickers, account auth, and BYOK were likewise skipped (host/Convex-locked, already-covered, or their own future slice).

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `settingsPageTools` — get/set over the live useSettings() result (optimistic save + rollback preserved).
