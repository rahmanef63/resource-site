# Primitive — data-table

> **Tier:** M
> **Lifted from:** cescadesigns/components/admin/DataTable.tsx (or scaffold from TanStack docs)

## Tujuan

TanStack Table v8 wrapper w/ filter/sort/pagination/CSV export. Headless, schema-driven, ResponsiveDialog row inspector.

## What it provides

See integration block. Self-contained — no domain assumptions.

## npm deps

```
@tanstack/react-table
```

## Integration

```tsx
import { DataTable } from "@/shared/components/table/DataTable";
const cols = [{ accessorKey: "name", header: "Name" }, { accessorKey: "email", header: "Email" }];
<DataTable columns={cols} data={rows} pageSize={20} />
```

## Schema additions

Most primitives don't need schema. Exceptions:
- `audit-log` → adds `auditLogs` table.
- `feedback-widget` → adds `feedback` table.
- `rate-limit` → adds `rateLimitBuckets` table (or in-memory if single-instance).
- `seed-bootstrap` → no new table; calls existing slice mutations.

If schema needed, follow SHARED.md §4 (additive only, `v.optional`,
`by_user` index convention).

## Env vars

- `email-pipeline` → `RESEND_API_KEY`
- `oauth-providers` → `AUTH_GITHUB_ID` + `AUTH_GITHUB_SECRET` + `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET`
- `ocr` → none (runs client-side)
- others → none

## Common breakage

- Path alias mismatch (consumer uses `src/` not `frontend/src/`) — fix `tsconfig.json` once, don't edit each import.
- Tailwind oklch tokens not present — port `theme-preset` first.
- Convex generated types stale — `pnpm backend:dev-sync`.
- Specific to this primitive — see source comments at lift path.

## Testing

1. Mount per integration example.
2. Verify happy path.
3. Verify error path (network down / invalid input / quota exceeded).
4. `pnpm typecheck && pnpm build` clean.
