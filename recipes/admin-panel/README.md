# Recipe: admin-panel

Unified product admin surface. Tier-aware (solo / influencer /
organization), permission-gated, owner-friendly out of the box.

Source: superspace `frontend/slices/platform-admin/` + custom spec.

Already at `template-base/frontend/slices/admin/` +
`template-base/convex/features/admin/`.

## Files

```
frontend/slices/admin/
├── config.ts                  # defineFeature + ADMIN_SECTIONS registry (17 sections)
├── page.tsx                   # <AdminPage workspaceId tier> entry
├── README.md                  # full feature spec (P0/P1/P2)
├── components/
│   ├── AdminShell.tsx         # 2-col layout, sidebar auto-filtered by tier+perms
│   └── AccessGate.tsx         # wrap pages — denies unauthorized users
├── hooks/
│   └── useAdminAccess.ts      # client-side access resolver (mirrors backend)
└── slices/
    └── events/lib/track-event.ts   # client SDK — initEventTracking + trackEvent

convex/features/admin/
├── access.ts                  # getMyAdminAccess query (single backend resolver)
└── events.ts                  # ingest mutation + recent query
```

## Visibility rules (frontend + backend agree)

| Source | Sees /admin |
|---|---|
| env `PLATFORM_ADMIN_EMAILS` includes user.email | always |
| `workspaces.userId === user._id` | always for that workspace |
| role slug `owner` / `admin` / role perm `*` | yes |
| `workspaceMemberships.additionalPermissions` ⊇ `PLATFORM_ADMIN` | yes |
| else | hidden — sidebar entry omitted |

Single backend resolver: `convex/features/admin/access.ts:getMyAdminAccess`.

## Wiring

1. **Schema** — already in template (analyticsEvents, workspaceMemberships, roles).
2. **Seed roles** — call `seedWorkspaceRoles(ctx, wsId, tier)` in workspace-create.
3. **Mount route** — at `app/admin/page.tsx`:

```tsx
"use client";
import { AdminPage } from "@/frontend/slices/admin";
import { useCurrentWorkspace } from "@/frontend/shared/...";

export default function Page() {
  const ws = useCurrentWorkspace();
  if (!ws) return null;
  return <AdminPage workspaceId={ws._id} tier={ws.tier ?? "solo"} />;
}
```

4. **Init tracking** — in `app/layout.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { useConvex } from "convex/react";
import { initEventTracking, trackPageView } from "@/frontend/slices/admin";
import { usePathname } from "next/navigation";

function Tracker() {
  const convex = useConvex();
  const path = usePathname();
  useEffect(() => { initEventTracking(convex); }, [convex]);
  useEffect(() => { trackPageView(path); }, [path]);
  return null;
}
```

5. **Env** — `npx convex env set PLATFORM_ADMIN_EMAILS you@example.com`.

## Section registry

17 sections in `config.ts → ADMIN_SECTIONS`. Each has `tiers` array — the
shell filters to the active tier so a `solo` workspace doesn't see
A/B Tests, Cohorts, Errors, Exports, Roles management.

Adjust the registry to match your product's needs — single source of
truth for both the sidebar and route gating.

## Spec

Full P0/P1/P2 feature spec lives at
`template-base/frontend/slices/admin/README.md` — copy that into your
project's `docs/` for the team.

## Standalone use

```bash
cp -r template-base/frontend/slices/admin frontend/slices/admin
cp -r template-base/convex/features/admin convex/features/admin
cp -r template-base/convex/lib/rbac convex/lib/rbac
```

Adjust imports — all use `@/convex/*` and `@/frontend/...` aliases that
match the kitab; nothing to rewrite if you copy into a kitab-shaped repo.
