# admin-console — the composed admin panel

The *ideal admin panel* as one portable slice. Not a monolith — a gated shell
plus a **section registry** distilled from ~15 project admin panels
(see [`docs/admin-panel/COMPARISON.md`](../../../docs/admin-panel/COMPARISON.md)
and [`DESIGN.md`](../../../docs/admin-panel/DESIGN.md)).

## What it is

- **26-section catalog** (`ADMIN_CONSOLE_SECTIONS`) across observability /
  identity / ai / content / commerce / config, each tagged with the rr slice
  that supplies it (`provider`) or `"self"` for the gap sections.
- **Gated two-column shell** (`AdminConsole`) — nav filtered by injected access
  + tier + permission; URL-synced active section (`?section=`).
- **5 net-new gap sections** nothing else in rr covered, adapter-driven with an
  in-memory mock so they work with zero backend:
  `AnalyticsDashboard`, `AuditLogViewer`, `NavConfigManager`, `LeadsInbox`,
  `SeoHealthPanel`.
- **Convex copy-source** (`convex/features/admin_console/`): `ac_leads` +
  `ac_nav_items` tables with `requireAdmin`-gated queries/mutations.

## What it is NOT

It does **not** reinvent users, RBAC, AI config, CMS, comments, newsletter,
settings, or media — those are existing rr slices. The console mounts them by
id. Because rr forbids slice→slice imports, reuse sections are rendered from a
`components` map **you** supply from the peers you installed.

## Usage

```tsx
import { AdminConsole } from "@/features/admin-console"
import { useAdminAccess } from "@/features/rbac-roles"   // your access source
import { UsersPanel } from "@/features/user-management"
import { AiProviders } from "@/features/ai-admin"

export default function AdminRoute() {
  const access = useAdminAccess(workspaceId)   // → { level, permissions, ... }
  return (
    <AdminConsole
      access={access}
      tier="org"
      components={{
        users: <UsersPanel />,
        "ai-config": <AiProviders />,
        // …one entry per reuse section you want live
      }}
    />
  )
}
```

- Owned sections (analytics, audit-log, nav-config, seo-health, leads) render
  automatically. Override any of them via the same `components` map to pass real
  data: `components={{ leads: <LeadsInbox leads={rows} onUpdateStatus={...} /> }}`.
- Reuse sections with no `components` entry show a "install `<slug>`" hint.
- Nothing installed / no peers? The demo route (`page.tsx`) still runs — mock
  access + mock adapters make the whole console interactive offline.

## Access + gating

`access` is injected — the slice never imports Convex. Gate logic
(`lib/access.ts`) is pure and unit-tested (`lib/access.test.ts`). Section gates
are permission tokens (`content.manage`, `crm.manage`, `audit.view`, …) or the
special `OWNER` / `PLATFORM_ADMIN` tokens, mirrored by the server mutations'
`requireAdmin`. Set `PLATFORM_ADMIN_EMAILS` on the backend for the superadmin
level.

## Backend

Compose the tables into your root schema:

```ts
import { adminConsoleTables } from "./features/admin_console/_schema"
export default defineSchema({ ...adminConsoleTables, /* … */ })
```

`ac_leads.create` is public (contact-form ingestion) — put the `rate-limit`
slice in front of it. Everything else is `requireAdmin`.
