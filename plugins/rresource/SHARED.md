# SHARED — Porting Baseline (read first)

Every `/rresource:<id>` skill assumes this baseline. Read once per
project; reuse across every skill invocation.

## 1. Target stack must satisfy

| Requirement | How to verify |
|---|---|
| Next.js 15+ App Router | `next --version`, `app/` exists |
| TypeScript strict | `tsconfig.json` `"strict": true` |
| pnpm or npm workspace | `@/*` path alias to `frontend/src/*` (or repo equivalent) |
| Self-hosted Convex (`@convex-dev/auth`) | `convex/schema.ts` + `convex/_generated/` |
| Tailwind v3+ with OKLCH semantic tokens | grep `oklch(var(` in `tailwind.config.ts` |
| shadcn/ui primitives | `components/ui/` populated |
| sonner Toaster mounted | `<Toaster />` in providers tree |
| Responsive shell (Mobile + Desktop containers) | `frontend/src/shared/containers/ResponsiveContainer.tsx` |

If anything missing → port `responsive-shell.md` + `auth.md` first.

## 2. Path aliases this kitab uses

```
@/                   → frontend/src/ (or src/, depending on consumer)
convex/              → convex/ at repo root
plugin cookbook root → <plugin-dir>/cookbook/
```

If the consumer's repo uses `src/` instead of `frontend/src/`, rewrite
`@/` to point at `src/` in their `tsconfig.json` BEFORE copying files —
do not edit each file's imports.

## 3. Convex module registration (manual fallback)

If the consumer is NOT running `pnpm backend:dev`, manually edit
`convex/_generated/api.d.ts` after copying a new domain:

```ts
import type * as <domain> from "../<domain>.js";

declare const fullApi: ApiFromModules<{
  // ...
  <domain>: typeof <domain>,
}>;
```

If they ARE running `pnpm backend:dev`, save any file in `convex/` and
the file regenerates.

## 4. Schema migration (additive only)

1. Open target `convex/schema.ts`.
2. Append tables listed in the skill — every new field MUST be
   `v.optional(...)` unless the same commit seeds existing rows.
3. Append `by_user` indexes the skill lists.
4. Run `pnpm backend:dev-sync` (or `npx convex dev --once`).
5. NEVER remove or rename existing tables.

## 5. Auth helpers — required by every mutation

```ts
import { requireUser, optionalUser, requireOwnedDoc } from "./_shared/auth";
```

- `requireUser(ctx)` — every mutation. Throws on no session.
- `optionalUser(ctx)` — every list query. Returns `null` on unauth so
  SSR + logout don't crash.
- `requireOwnedDoc(ctx, id, "Label")` — typed ownership check. Throws
  `"<Label> tidak ditemukan"` (NOT `"forbidden"`) — avoids enumeration.

## 6. AI action pipeline (mandatory order)

```
requireQuota(ctx) → sanitizeAIInput() → wrapUserInput() → OpenAI-compat proxy
```

Skip any stage = audit-bp P0 fail.

## 7. Nav registration (for dashboard slices)

1. `frontend/src/shared/lib/dashboardRoutes.tsx` — add lazy entry to
   `DASHBOARD_VIEWS`. ALWAYS use `next/dynamic`.
2. `frontend/src/shared/components/layout/navConfig.ts` — append to
   `PRIMARY_NAV` or `MORE_APPS`. Slug must match `DASHBOARD_VIEWS` key.
3. Optional: `superAdminOnly: true` on `MoreAppTile` →
   `useVisibleMoreApps()` filters.

## 8. Indonesian copy (R8)

All UI strings + Convex error messages are Indonesian. Bulk i18n =
1-3h per slice. Grep `"Tambah"`, `"Simpan"`, `"Hapus"`, `"Batal"`,
`"Gagal"`, `"Berhasil"` to find them.

## 9. Env vars baseline

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | All frontend |
| `CONVEX_OPENAI_API_KEY` | Any AI action |
| `CONVEX_OPENAI_BASE_URL` | OpenAI-compat endpoint |
| `JWT_PRIVATE_KEY` + `JWKS` | `@convex-dev/auth` |
| `ADMIN_BOOTSTRAP_EMAILS` | Role bootstrap |
| `CONVEX_SITE_URL` | `auth.config.ts` |

## 10. Tier table (porting effort)

| Tier | Meaning | Effort |
|---|---|---|
| **S** | Slice-only, 1 `cp -r`, no schema | 15 min |
| **M** | Slice + 1-2 shared deps + maybe 1 module | 1 h |
| **L** | Slice + shared + new schema + ext deps | 2-4 h |
| **XL** | Cross-cutting infra | 3-8 h |

## 11. Hard rules (R1..R17 — non-negotiable)

- **NO** Clerk / Auth0 / NextAuth. Auth = `@convex-dev/auth` only.
- **NO** raw `<button>`, `<input type=date|file>`, `<dialog>`. Use
  shadcn `Button`, `DateField`, `FileUpload`, `ResponsiveDialog`.
- **NO** `<a href="/internal">`. Use `next/link` or `SmartLink`.
- **NO** `<img src="...">`. Use `next/image`.
- **NO** bare `.collect()` on Convex queries. Use
  `.withIndex(...).take(N)` or pagination.
- **NO** public Convex fn without `args: { ... }` validator.
- **NO** Server Action without `requireUser` + ownership check.
- **NO** `NEXT_PUBLIC_*` for sensitive values.
- **NO** `middleware.ts` on Next 16. Use `proxy.ts`.
- **NO** Scrypt. PBKDF2-SHA256 100k iter only (Scrypt times out
  behind reverse proxies).

## 12. Verification checklist (after every port)

- [ ] `pnpm typecheck` (frontend + convex)
- [ ] `pnpm lint --max-warnings=0`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm backend:dev-sync` regenerated types
- [ ] Schema additions accepted by `pnpm backend:deploy`
- [ ] Nav entry visible at expected URL
- [ ] Mutations succeed, data persists across reload
- [ ] Indonesian copy translated (if applicable)
- [ ] `requireUser` on every mutation, `optionalUser` on every list
