# Changelog — notifications-center


## 0.3.0 — 2026-09-13

- Added native Svelte 5/SvelteKit Bell/List/Item UI plus a Svelte-readable adapter while React/Next remains the default.
- Extracted framework-neutral notification state for newest-first sorting, All/Unread filtering, unread counts, and adapter mutation actions; React `useNotifications` is now a thin adapter.
- Fixed catalog drift so the default React installer includes `lucide-react@^0.400.0`; the public preview route now hosts canonical `preview.tsx` instead of duplicating seed data.

## 0.2.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `notificationsCenterTools` — list/mark_read/mark_all_read/dismiss/clear over the live useNotifications() result.
