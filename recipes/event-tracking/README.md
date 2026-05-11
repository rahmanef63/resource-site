# Recipe: event-tracking

P0 instrumentation core — events, attribution, sessions. Required
before any analytics / funnel / activation feature.

Already at `template-base/frontend/slices/admin/slices/events/` +
`template-base/convex/features/admin/events.ts`. Uses the existing
`analyticsEvents` table (no new schema).

## Captured

- `page_view` — auto on every route
- `signup_start`, `signup_complete`, `login`, `logout` — wire into auth flow
- Custom — `trackEvent({ eventType, properties })`

## Captured context (auto)

UTM params (`utm_source/medium/campaign/term/content`), referrer,
landing path, user agent. **First-touch** stored in localStorage,
**last-touch** read fresh on every event.

## Performance

- Batched flush via `requestIdleCallback` every ~500ms
- Re-queue on failure (cap 500 events)
- Backend p99 target <100ms

## Wire-up

```tsx
// app/layout.tsx (client component)
"use client";
import { useEffect } from "react";
import { useConvex } from "convex/react";
import { usePathname } from "next/navigation";
import {
  initEventTracking,
  trackPageView,
} from "@/frontend/slices/admin";

function Tracker() {
  const convex = useConvex();
  const path = usePathname();
  useEffect(() => { initEventTracking(convex); }, [convex]);
  useEffect(() => { trackPageView(path); }, [path]);
  return null;
}
```

```tsx
// inside auth handlers
import { trackSignupComplete, trackLogin } from "@/frontend/slices/admin";

await signIn(...);
trackSignupComplete(user._id, "google");
```

## Query

```ts
// last 100 events live (reactive)
const events = useQuery(api.admin.events.recent, { workspaceId, limit: 100 });
```

## Schema

`analyticsEvents` table — already in `template-base/convex/features/analytics/schema.ts`. Indexes:
- `by_workspace`
- `by_workspace_type` (workspaceId, eventType)
- `by_workspace_timestamp` (workspaceId, timestamp)
- `by_user`

## Standalone use

```bash
cp template-base/frontend/slices/admin/slices/events/lib/track-event.ts frontend/lib/track-event.ts
cp template-base/convex/features/admin/events.ts convex/events.ts
# Ensure analyticsEvents table is registered in your convex/schema.ts
```

## Next steps (P0 remaining)

- Funnel builder — `convex/features/admin/funnels.ts` (TODO)
- Attribution table — denormalize first/last-touch onto `users` row
- Activation event config — per-product, stored on `workspaces` row
