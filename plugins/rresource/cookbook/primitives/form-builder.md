# Primitive — form-builder

> **Tier:** M
> **Lifted from:** Scaffold — react-hook-form + @hookform/resolvers/zod + shadcn form.tsx

## Tujuan

zod schema → react-hook-form bindings → shadcn Form components. Generic factory.

## What it provides

See integration block. Self-contained — no domain assumptions.

## npm deps

```
react-hook-form @hookform/resolvers zod
```

## Integration

```tsx
import { useZodForm } from "@/shared/forms/useZodForm";
const Schema = z.object({ email: z.string().email(), name: z.string().min(2) });
const form = useZodForm(Schema, { defaultValues: { email: "", name: "" } });
<Form {...form}><FormField name="email" … /></Form>
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
