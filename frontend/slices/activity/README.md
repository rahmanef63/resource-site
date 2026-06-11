# activity

Public productivity log — lists user-facing activities grouped by ISO week. Designed to maximise SEO so the question "what is `<person>` working on this week?" lands here.

## Wire surface

- **Public view component** — `<ActivityFeed rows stats copy categoryLabels locale />`
- **Convex schema extension** — `activityTables` from `convex/features/activity/_schema.ts`
- **Convex queries** — `listPublic`, `get`, `statsThisWeek` (public) + `listAll` (internalQuery — returns private rows too, so the consumer wraps it in an auth-gated query, same pattern as the mutations)
- **Convex mutations** — `create`, `update`, `remove`, `seed` (all unauthenticated — consumer wraps)
- **MCP tools** — your consumer's MCP server can map: `activity_list`, `activity_create`, `activity_update`, `activity_remove`

## Install

```bash
npx rr add activity
```

Then in your root Convex schema:

```ts
// convex/schema.ts
import { defineSchema } from "convex/server";
import { activityTables } from "./features/activity/_schema";

export default defineSchema({
  ...activityTables,
  // ...your other tables
});
```

Then wrap the unauthenticated mutations with your auth model:

```ts
// convex/api/activity.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "@/features/convex-auth/server/admin"; // or your own auth helper
import {
  create as createInternal,
  update as updateInternal,
  remove as removeInternal,
} from "../features/activity/mutations";

export const create = mutation({
  args: { token: v.string(), /* ...activity shape */ },
  handler: async (ctx, { token, ...args }) => {
    await requireAdmin(ctx, token);
    return ctx.runMutation(createInternal, args);
  },
});
// repeat for update + remove
```

Mount the view:

```tsx
// app/activity/page.tsx
import { ActivityFeed } from "@/features/activity";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Page() {
  const [rows, stats] = await Promise.all([
    fetchQuery(api.api.activity.listPublic, {}),
    fetchQuery(api.api.activity.statsThisWeek, {}),
  ]);
  return <ActivityFeed rows={rows} stats={stats} />;
}
```

## Schema highlights

| Field | Notes |
|---|---|
| `category` | `code` \| `ship` \| `learn` \| `design` \| `ops` \| `personal` |
| `source` | `manual` \| `mcp` \| `gpt` \| `claude` — provenance |
| `visibility` | `public` \| `private` — `listPublic` filters via `by_visibility_occurredAt` index |
| `occurredAt` | epoch ms; canonical sort key |
| `tags` / `links` | optional surface for entity context |
| `durationMin` | optional; powers weekly stats panel |

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `rows` | `ActivityRow[]` | required | from `listPublic` query |
| `stats` | `ActivityStats \| null` | `null` | from `statsThisWeek` query — set null to hide panel |
| `copy` | `Partial<ActivityCopy>` | English defaults | All user-facing strings (eyebrow, title, body, empty state, week label template…) |
| `categoryLabels` | `Partial<Record<string, string>>` | English defaults | Override per-category display labels |
| `locale` | `string` (BCP-47) | `"en-US"` | Date/time formatting locale |

## Module layout

| Path | Purpose |
|---|---|
| `views/ActivityFeed.tsx` | Top-level view (wrapper, hero, week groups). |
| `components/StatsPanel.tsx` | 7-day rollup card. |
| `components/ActivityItem.tsx` | Single row (header, body, tags, links). |
| `lib/grouping.ts` | `isoWeek`, `groupByWeek` — ISO-8601 week bucketing. |
| `lib/format.ts` | `fmtDate`, `fmtTime` — locale-aware. |
| `lib/types.ts` | `ActivityRow`, `ActivityStats`, `ActivityCopy`, `ActivityFeedProps`. |
| `lib/defaults.ts` | `DEFAULT_COPY` (English) + `DEFAULT_CATEGORY_LABELS`. |
| `convex/features/activity/_schema.ts` | `activityTables` extension + reusable value union exports. |
| `convex/features/activity/query.ts` | `listAll`, `listPublic`, `get`, `statsThisWeek`. |
| `convex/features/activity/mutation.ts` | `create`, `update`, `remove`, `seed` — unauthenticated. |

## Origin

Lifted from `rahmanef.com` on `2026-05-27`. ActivityFeed split from a 225-LOC monolith into one view + two sub-components + four `lib/` helpers for the 200-LOC cap. All Indonesian copy strings + custom `<Section>`/`<Heading>` primitives + brutalist Tailwind utilities (`tracking-brutal-sm`, `border-foreground`) stripped — replaced with English defaults + raw semantic elements + stock utilities (`tracking-wider`, `border-2`). Project-specific `seedDefaults` mutation (3 hardcoded rahmanef.com seed rows) dropped in favour of the generic `seed` mutation that accepts arbitrary items. Cross-slice `requireAdmin` import dropped — mutations now ship as `internalMutation` and the consumer wraps them with their own auth helper (see Install above).
