# convex/features/admin_console

Net-new backend for the `admin-console` slice. Copy-source — compose into your
own root schema; rr's own backend does not deploy it.

## Tables (`_schema.ts`)

- `ac_leads` — CRM / contact inbox rows (`status: new|open|won|lost`, notes[]).
- `ac_nav_items` — navigation config (label, href, order, visible, parentId).

```ts
import { adminConsoleTables } from "./features/admin_console/_schema";
export default defineSchema({ ...adminConsoleTables, ...others });
```

## Functions

- `leads.ts` — `list` / `get` / `updateStatus` / `addNote` (`requireAdmin`);
  `create` is **public** (contact-form ingestion, length-guarded). Front it with
  the `rate-limit` slice.
- `navConfig.ts` — `list` (public read for the site menu) + `upsert` / `remove` /
  `reorder` (`requireAdmin`).

`requireAdmin` comes from `convex/_shared/auth` (the convex-auth peer). Table
names are `ac_`-prefixed to avoid collision with peer slices.
