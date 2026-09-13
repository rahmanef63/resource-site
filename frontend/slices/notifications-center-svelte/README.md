# Notifications Center — Svelte 5 / SvelteKit

Native Svelte notification bell/inbox UI over the canonical adapter-driven feed
engine. React/Next remains the default distribution.

```bash
npx rr add notifications-center --framework sveltekit
```

The Svelte distribution ships Bell/List/Item plus `createNotificationsStore` and
reuses the same notification types, adapter contract + in-memory adapter,
newest-first state/filter rules, relative-time formatter, and agent tools.

No React, Next, Lucide, or shadcn dependency is required. The host can replace
the in-memory adapter with Convex, websocket, or any external store implementing
`NotificationsAdapter`.
