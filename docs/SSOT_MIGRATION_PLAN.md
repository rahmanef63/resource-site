# SSOT Migration Plan — `resources/` as Kitab

> Date: 2026-05-12  
> Goal: All Rahman projects (superspace, notion-page-clone, rahmanef.com, content-rahmanef-com, CareerPack, future) consume features + shared primitives from `/home/rahman/projects/resources/` as single source of truth.

---

## 1. Architecture

```
resources/                              ← KITAB (canonical source)
├── shared/                             ← Reusable primitives (publish as npm)
│   ├── ui/
│   │   ├── ResponsiveDialog/
│   │   ├── SmartLink/
│   │   ├── SharedDatePicker/
│   │   ├── FileUpload/
│   │   └── ...
│   ├── lib/
│   ├── hooks/
│   └── types/
├── frontend/slices/                    ← Reusable features (copy via CLI)
│   ├── auth/                           (from CareerPack/content — convex-auth + PBKDF2)
│   ├── blog-mdx/                       (from rahmanef.com)
│   ├── workspaces/                     (from superspace)
│   ├── billing-clerk-or-convex/        (auth-agnostic)
│   └── ...
├── convex/features/                    ← Backend mirrors per slice
│   └── <slice>/{schema,queries,mutations}.ts
├── packages/
│   ├── cli/                            ← `npx rahman-resources`
│   ├── mcp/                            ← MCP server
│   └── shared/                         ← `rahman-shared` npm package
├── template-base/                      ← Greenfield starter
├── cookbook/                           ← Integration recipes (Resend, Cal, Midtrans)
└── docs/
```

---

## 2. Distribution Model — Hybrid

### A. Shared primitives → npm package (`rahman-shared`)

```bash
# In consumer project
pnpm add rahman-shared
```

```tsx
import { ResponsiveDialog, SmartLink, FileUpload } from "rahman-shared/ui"
```

- Semver pinned, opaque module
- Updates via `pnpm up rahman-shared`
- **Why**: primitives stable, want auto-bugfix propagation

> **Status 2026-05-13 — Phase 5 ACHIEVED**: `rahman-shared@0.2.0` LIVE on **public npm** (unscoped — `@rahman` scope didn't exist; matched `rahman-resources` + `rahman-resources-mcp` pattern). Current shape is **utils + hooks only** (cn, formatDate, sanitizeHtml, useDebounce, useClickOutside, useResponsive). UI components (ResponsiveDialog, SmartLink, DateField, etc.) distributed via **CLI scaffold** (`npx rahman-resources add <slug>`) — consumer owns the file locally and customizes Tailwind classes. Distribution split formalized in `resources/CLAUDE.md`. 4/5 consumers adopted via skill `/use-adopt-rahman-shared`. superspace pending Phase 5.5.

### B. Features (slices) → CLI copy

```bash
npx rahman-resources add slice auth
npx rahman-resources add slice blog-mdx
```

- Files copied into consumer's `frontend/slices/<name>/` + `convex/features/<name>/`
- `slice.manifest.json` declares deps (other slices, shared modules, env vars)
- **Why**: features need customization per project

### C. Templates → CLI scaffold (greenfield)

```bash
npx rahman-resources init my-new-app
```

- Bootstrap full project from `template-base/`
- **Why**: zero-config greenfield matching baseline standard

---

## 3. Migration Phases

### Phase 0 — Foundation (Week 1-2)
**Goal**: All 6 projects on same baseline before lifting code.

| Task | Project | Effort |
|------|---------|--------|
| Fix TS strict | notion-page-clone | M |
| Add ESLint | notion, resources | S |
| Write CLAUDE.md | rahmanef.com | S |
| Rename `frontend/src` → `frontend` | CareerPack | M |
| Bump Next 15→16 | superspace, rahmanef, CareerPack | M each |
| Bump Tailwind v3→v4 | rahmanef, CareerPack | M each |
| npm → pnpm | resources, notion, rahmanef, content | S each |

**Exit criteria**: All 6 projects pass `pnpm typecheck && pnpm lint && pnpm test`.

---

### Phase 1 — Resources Stabilization (Week 3)
**Goal**: Make `resources/` itself bulletproof.

- Audit `resources/` against own baseline standard
- Run `npm run audit:bp` clean
- Lock package manager → pnpm
- Set up `pnpm workspaces` if needed
- Define `shared/` directory structure (currently primitives scattered across `components/`)
- Define `slice.manifest.json` v1 schema

**Schema sketch**:
```json
{
  "name": "auth",
  "version": "1.0.0",
  "description": "Convex Auth + PBKDF2 hasher + Google OAuth",
  "deps": {
    "shared": ["ResponsiveDialog", "SmartLink"],
    "slices": [],
    "convexFeatures": [],
    "npm": {
      "@convex-dev/auth": "^0.0.92",
      "@auth/core": "^0.37.4"
    },
    "env": ["JWT_PRIVATE_KEY", "JWKS", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"]
  },
  "files": [
    "frontend/slices/auth/**",
    "convex/features/auth/**"
  ]
}
```

---

### Phase 2 — Harvest Shared Primitives (Week 4)
**Source**: superspace (most mature primitives).

| Primitive | From | Action |
|-----------|------|--------|
| ResponsiveDialog | superspace `components/ui/responsive-dialog` | Copy → `resources/shared/ui/` |
| SmartLink | superspace `components/ui/smart-link` | Copy + tests |
| SharedDatePicker | superspace `components/ui/date-picker` | Copy + RHF wiring |
| DateField | superspace | Copy |
| FileUpload | superspace (auto-WebP) | Copy + server mime enforcement |
| Form wrappers | superspace | Copy |

**Validate**: write unit tests for each primitive in `resources/shared/ui/<Name>/test.tsx`.

**Publish**: `pnpm --filter rahman-shared publish` to private npm registry (Verdaccio or GitHub Packages).

---

### Phase 3 — Harvest Features (Week 5-7)
**Pick winners across projects, normalize, copy into `resources/frontend/slices/`.**

Priority slices (most reusable):

| Slice | Best Source | Notes |
|-------|-------------|-------|
| auth | CareerPack (convex-auth + PBKDF2) | Reverse-proxy-safe |
| workspaces | superspace + notion | Multi-tenant gate |
| blog-mdx | rahmanef.com | SEO-first |
| file-upload | superspace | WebP pipeline |
| ai-router | resources (existing) | OpenRouter |
| billing | superspace (Clerk) | Optional Clerk variant |
| newsletter | content/rahmanef | Resend |
| booking | content (Cal.com) | Existing recipe |
| payments | content (Midtrans + DOKU) | Existing recipe |
| editor-blocks | notion-page-clone | Rich-text inline |
| seo | rahmanef.com | Schema.org full coverage |
| admin-crud | rahmanef.com | Generic CRUD shell |
| audit-log | superspace | RBAC + audit |

For each: extract → normalize imports to `rahman-shared` → write `slice.manifest.json` → add test.

---

### Phase 4 — CLI Hardening (Week 8)
**Existing**: `packages/cli` has `init`, `add`, `add-skill`. Extend:

- `rahman-resources add slice <name>` — copy slice + deps resolution
  - Read `slice.manifest.json`
  - Recursively pull `deps.slices`, `deps.convexFeatures`, `deps.shared` (if not pkg-installed)
  - Patch `package.json` with `deps.npm`
  - Append `deps.env` to `.env.example`
  - Print post-install instructions
- `rahman-resources update slice <name>` — pull latest, show diff before overwrite
- `rahman-resources doctor` — verify consumer project on baseline

---

### Phase 5 — Consumer Migration (Week 9-16)
**One project per week**. Order by complexity (simple → hard):

1. **rahmanef.com** (Week 9) — smallest surface, custom auth → migrate to convex-auth via resources/auth slice
2. **CareerPack** (Week 10) — clean slice arch, just adopt shared/
3. **content-rahmanef-com** (Week 11-12) — heavy slice count, already convex-auth
4. **notion-page-clone** (Week 13-14) — refactor Context monolith → resources patterns
5. **superspace** (Week 15-16) — biggest, Clerk decision needed

**Per-project process**:
1. `pnpm add rahman-shared`
2. Replace local primitives with imports from `rahman-shared`
3. For each existing slice → either: keep custom (project-specific) OR migrate to `npx rahman-resources add slice <name>`
4. Run validators
5. Deploy to staging
6. Smoke test
7. Promote

---

### Phase 6 — Ongoing Maintenance
- `resources/` releases follow semver
- `rahman-shared` major bumps gate behind RFC
- Slice changes flow: bug → fix in `resources/` first, then propagate to consumers via `rahman-resources update`
- CI in `resources/`: every PR must pass `audit-bp` + slice validation

---

## 4. Decisions (RESOLVED 2026-05-12)

| Q | Decision | Notes |
|---|----------|-------|
| Where to host `rahman-shared`? | **GitHub Packages** | Free private, integrated, `.npmrc` + `publishConfig` |
| Auth: keep Clerk in superspace? | **Drop Clerk** | Data-preserving migration in Phase 5.5, Google `sub` join key |
| Convex schema collision? | **Namespaced `<slice>_<table>`** mandatory | CLI validates, manifest declares |
| Versioning slices? | **Per-slice semver** | In manifest, enforced by CLI |
| Studio lift to resources? | **DEFERRED** | Revisit post-Phase 5 based on demand |
| Shared CSS tokens? | CSS vars in `shared/` + per-project override | OKLCH base + tweakcn presets |

## 4.5. Phase 5.5 — Clerk → Convex Auth Migration (superspace only)

**Status**: separate operator-only phase, never autonomous-loop.

**Why operator-only**: production user data + active OAuth sessions + RBAC mappings at risk.

**Zero-data-loss invariant**: Google OAuth `sub` (subject ID) is preserved across providers. Same Google client ID + secret used by Clerk → Convex Auth. User Google login → Convex matches by `authAccounts.providerAccountId === sub` → user lands on pre-synced data row.

**Steps** (operator runs each manually with verification):

1. **Export** Clerk users (Backend API) → JSON. Fields: id, primaryEmail, externalAccounts[google].providerUserId, name, image, metadata, createdAt.
2. **Schema** additions to Convex `users`: `clerkUserId` (string), `migratedAt` (number). Index on `clerkUserId`.
3. **Sync script** (`scripts/clerk/sync-to-convex.mjs`): upsert `users` row + `authAccounts` row (provider='google', providerAccountId=sub). Idempotent.
4. **Staging dry-run**: sync to staging Convex, verify counts match.
5. **Nightly cron** Clerk→Convex during dual period to catch new signups.
6. **Same OAuth config**: confirm Google Cloud client ID + secret reused between Clerk and Convex.
7. **Mount Convex Auth alongside Clerk** (feature-flagged off).
8. **Dual-read code path**: every server fn that reads `clerkUserId` ALSO accepts `convexUserId`. Behind `AUTH_PROVIDER` env var.
9. **Staging cutover**: flip flag, smoke test with real Google account, verify existing data accessible.
10. **Production cutover** (announced 7 days prior):
    - Flip `AUTH_PROVIDER=convex`
    - Frontend: replace `<ClerkProvider>` with `<ConvexAuthProvider>`
    - All active Clerk sessions → logout once, re-login via Google
    - Monitor login error rate
11. **Non-Google users** (Clerk password): send password-reset email flow via Resend, link to Convex password setup.
12. **Webhooks rewire**: Clerk `/api/webhooks/clerk` → Convex `http.ts` endpoints.
13. **30-day grace**: Clerk subscription stays active. Rollback = flip flag back, re-mount ClerkProvider.
14. **Cleanup** (post-grace): remove Clerk SDK from package.json, cancel subscription.

**Rollback at every step**: feature flag, NOT destructive removal until step 14.

**Existing data NEVER deleted** during migration. New table additive only.

---

## 5. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Lift-and-shift breaks production | Stage in `resources/` first, run audit-bp, smoke test before consumer migration |
| `rahman-shared` becomes blocker | Keep API thin; complex things stay as slices |
| Convex schema collision | Mandatory table prefix in slice manifest |
| Drift returns after migration | CI gate: `rahman-resources doctor` runs in each consumer CI |
| Project-specific customization needed | Slices copied (not linked) — customize freely; only `shared/` is opaque |
| Auth migration loses sessions | Run dual-auth period, mass password reset, communicate to users |

---

## 6. Success Metrics

- All 6 projects share same `package.json` engines + tooling versions
- Each project imports primitives from `rahman-shared` (zero local copies)
- New project setup: `npx rahman-resources init` → working app in <5 min
- Add new feature: `npx rahman-resources add slice <name>` → working in <2 min
- Bug in primitive fixed once, propagates via `pnpm up`
- Zero divergence on auth strategy
- CI `rahman-resources doctor` passes in all 6

---

## 7. Next Step

Phase 0 first. Pick one of:
- **A**: Smash all Phase 0 tasks this session (TS strict, ESLint, CLAUDE.md, path rename)
- **B**: Just CLAUDE.md + ESLint (quick wins, 1 hr)
- **C**: Start with `resources/` audit (Phase 1 prep)
- **D**: Define `slice.manifest.json` schema first (unblocks Phase 2-3)
