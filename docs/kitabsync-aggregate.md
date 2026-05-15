# KitabSync Aggregate Report

> Last refresh: 2026-05-15 (post Wave N+3.7 — command-menu@0.2.0 UP-sync ingest from notion)
> Source: scrape of `<consumer-repo>/docs/kitabsync.md` × 6 consumers + live `npm run scan:consumers`
> Skipped: cescadesigns (operator decision — minimal overlap expected)
> Kitab snapshot ref: this commit

## Wave N+3.7 deltas (2026-05-15 — late late late)

| # | Action | Side | Result |
|---:|---|---|---|
| 14 | `command-menu@0.2.0` UP-sync ingest from notion-page-clone | kitab | Adopted notion's renderless `CommandPalette` + `CommandGroupList` + label-bag-driven `SearchModal` from `command-palette@0.3.0` portable surface. NEW tier-3 slice at `frontend/slices/command-menu/` (was: facade-only entry pointing at template-base). Dropped notion's `adapters/nosion.tsx` + `adapters/NosionCommandPalette.tsx` + `ShortcutsDialog` (consumer-only). Refactored `SearchModal` to take `bindings: SearchModalBindings` (pages/databases/recents + onSelect callbacks) instead of pulling `useStore`/`useSearch`/`useNavigate`/`DynamicIcon` directly. Renamed history key `nosion.cmdk.history → kitab.cmdk.history`. Contract bumped `0.1.0 → 0.2.0` with `forbiddenTerms: ["nosion","Nosion"]` + `requiredProps: ["groups","onNavigate","labels"]`. 8 vitest cases lock the CommandGroup/CommandItem/CommandPaletteLabels/SearchModalLabels shapes + DEFAULT constants. |
| — | Cross-consumer matrix update | kitab | notion `command-menu` flips `up-needed (kitab 0.1.0)` → `up-needed (kitab 0.2.0)` because notion still ships the consumer-side `adapters/` extras. Verdict still flagged — see follow-up #15. |
| — | Per Wave N+3.6 follow-up #14 | kitab | Action 14 of run history closed. rahmanef.command-palette consumer DOWN-sync now possible against `command-menu@0.2.0`. |

## Wave N+3.6 deltas (2026-05-15 — late late)

| # | Action | Side | Result |
|---:|---|---|---|
| 11 | `mdx-blog@0.2.0` UP-sync ingest from content-rahmanef-com | kitab | Adopted content's `defineMdxBlog(opts)` portable factory + 4 config props (basePath / contentDir / labels.list / nav). `MDX_BLOG_DEFAULTS` constant + `resolveMdxBlogOptions` resolver. `BlogList` accepts `title` + `contentDir` props. Pure UI/factory refactor — no Convex side, no migration script needed. Contract bumped 0.1.0→0.2.0 with `forbiddenTerms: ["rahmanef","content.rahmanef.com"]` + `requiredProps: ["basePath","contentDir","labels","nav"]`. 8 new vitest cases lock the factory shape. |
| — | Cross-consumer matrix update | kitab | content `mdx-blog` flips `up-needed → in-sync` (kitabVersion + consumerVersion both `0.2.0`). rahmanef `blog` slice now eligible for DOWN-sync to align with the new factory shape. |
| — | Per Wave N+3.5 follow-up #11 | kitab | Action 11 of run history closed. Stranded slugs unchanged (still 6). |

## Wave N+3.5 deltas (2026-05-15 — late)

| # | Action | Side | Result |
|---:|---|---|---|
| — | `comments@0.2.0` Convex layer rebuild | kitab | Table renamed `comments → comment_threads`. Schema dropped notion-specific `pageId`/`blockId`/`pages` FK. Mutations + queries rewritten generic-TargetRef. Contract `convex.prefix: "comment_"` declared. |
| — | `audit-log@0.2.0` ship | kitab | TenantAdapter type + `createAuditLogger` factory + `NULL_TENANT_ADAPTER`. Schema renamed `auditLogs → audit_events`, index `by_tenant_id_at`, optional tenantId. Contract bumped 0.1.0→0.2.0 with `forbiddenTerms: ["workspaceId","auditLogs"]` + `requiredProps: ["tenantAdapter","bindings"]`. |
| — | Migration scripts created | kitab | `scripts/migrations/audit-log-v0.1.0-to-v0.2.0-tenant-adapter.ts` + `comments-v0.1.0-to-v0.2.0-polymorphic-target.ts` (paginated batched internalMutation walkers). |
| 3 | `comments` notion adoption | notion-page-clone | SHA `d9413e4` · v0.2.0 portable + in-sync. TargetRef polymorphic-target adopted. Adapter wiring isolated under `adapters/nosion.*`. 412/412 tests. |
| 3 | `comments` rahmanef divergence flagged | rahmanef.com | SHA `430c35b` · honest no-op refactor. Status flipped `portable → needs-adapter · frozen` with 7 documented blockers. Architectural mismatch — see `docs/comments-split-proposal-2026-05-15.md`. |
| — | `comments-split-proposal-2026-05-15.md` | kitab | Operator decision proposal: super-contract (Option A) vs `public-comments` carve (Option B, recommended) vs hybrid (Option C, deferred). |
| — | Content `audit-log/.kitab.json` parse-error fix | content-rahmanef-com | `lastPullAt` numeric → ISO string. Scanner clean across 6 consumers now. |
| 9 | `platform-admin@0.1.0` scaffold | kitab | (Wave N+3.4) shipped contract-only scaffold with adapter spec. Distinct slug from per-instance `admin`. |

## Wave N+3.3 deltas (2026-05-15 late evening)

| # | Action | Consumer / Side | Result |
|---:|---|---|---|
| 4 | `command-menu` 5-blocker renderless refactor | notion-page-clone | SHA `068709c` · `0.2.0 → 0.3.0` portable + bidirectional. Renderless `CommandPalette` + `lib/types.ts` + `adapters/nosion.*` isolated. SearchModal accepts `labels?` prop. 412/412 tests + build pass. |
| — | Contract level alignment with decisions doc | kitab | SHA `0ccd403` · 3 slices flipped `portable → needs-adapter`: `ai-router`, `audit-log`, `comments`. Reflects required-adapter prop surface per docs/contract-negotiations-2026-05-15.md. |
| — | scan-consumers multi-path walker | kitab (CLI lib) | SHA `0ccd403` · `walkConsumerSlices` now scans BOTH `frontend/slices/` AND `frontend/src/slices/` (CareerPack uses nested path). |

## Wave N+3.1 deltas (2026-05-15 evening)

Three actions from the previous aggregate's top-10 list shipped:

| # | Action | Consumer | Result |
|---:|---|---|---|
| 5 | `mdx-blog` 5 blockers parameterised | content-rahmanef-com | SHA `c6729a5` · `0.1.0 → 0.2.0` portable + bidirectional |
| 7 | `seo` SYSTEM_PROMPT persona hoisted | rahmanef.com | SHA `bde5763` · `0.1.0 → 0.2.0` portable |
| 8 | `admin` nav derived from slice registry | rahmanef.com | SHA `b542389` · `0.1.0 → 0.2.0` portable |

All three precommit-hook clean (typecheck + lint + tests). All three now show `up-needed` against kitab `0.1.0` — UP-sync via `/rr-send` is the next step (gated on kitab maintainer accepting the slug for bidirectional flow + signing the contract version bump).

## Per-consumer roll-up (refreshed)

| Consumer | Adopted | Verdict mix | Generalization mix | Top P0 |
|---|---:|---|---|---|
| **CareerPack** | 1 | in-sync=1 · kitab-only=14 | needs-adapter=1 | `document-checklist` (architectural mismatch — single-user vs workspace) |
| **notion-page-clone** | 2 | **up-needed=1** · diverged=1 · consumer-only=33 · kitab-only=6 | **portable=1** · needs-adapter=1 | `comments` (still — coordinate with rahmanef) |
| **rahmanef.com** | 6 | in-sync=4 · up-needed=2 · consumer-only=20 · kitab-only=9 | portable=4 · needs-adapter=2 | `comments` (coordinate with notion) |
| **content-rahmanef-com** | 3 | in-sync=2 · up-needed=1 · consumer-only=5 · kitab-only=4 | portable=3 · needs-adapter=0 | All adopted are portable — ready for kitab merge |
| **superspace** | 4 | diverged=4 · consumer-only=46 · kitab-only=11 | needs-adapter=2 · consumer-locked=2 | `ai` (P0) + `audit-log` (P0) |
| **TOTAL** | **16 manifests** | **up-needed=4** | **portable=8** · needs-adapter=6 · consumer-locked=2 | — |

Net portability shift across Wave N+3.1 + N+3.3: **+4 portable, −4 needs-adapter** in one evening. Plus 1 new up-needed verdict (command-menu).

## Cross-consumer slug matrix (refreshed)

Reads as: `verdict · generalization` (alias in parens when consumer renamed the slug).

| Kitab slug | CareerPack | notion | rahmanef | content | superspace |
|---|---|---|---|---|---|
| `admin` | kitab-only | kitab-only | **up-needed · portable** ⇡ | kitab-only | diverged · consumer-locked (as `platform-admin`) |
| `ai-router` | kitab-only | kitab-only | kitab-only | kitab-only | **diverged · needs-adapter** (as `ai`) |
| `audit-log` | kitab-only | kitab-only | in-sync · portable (as `audit`) | kitab-only | **diverged · needs-adapter** |
| `broadcast-channel-sync` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `cal-com-booking` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `comments` | kitab-only | **diverged · needs-adapter** | in-sync · needs-adapter | kitab-only | kitab-only |
| `convex-auth` | kitab-only | kitab-only | in-sync · needs-adapter (frozen as `auth`) | in-sync · portable | kitab-only |
| `document-checklist` | in-sync · needs-adapter | kitab-only | kitab-only | kitab-only | kitab-only |
| `doku-payment` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `full-width-toggle` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `mdx-blog` | kitab-only | kitab-only | in-sync · portable (as `blog`) | **up-needed · portable** ⇡ | diverged · consumer-locked (as `blog`, plain-text) |
| `midtrans-payment` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `resend-newsletter` | kitab-only | kitab-only | kitab-only | in-sync · portable | kitab-only |
| `seo` | kitab-only | kitab-only | **up-needed · portable** ⇡ | kitab-only | kitab-only |
| `vector-search` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |

⇡ = changed since previous aggregate (Wave N+3.1 delta)

### Stranded slugs (no consumer adoption — unchanged)

`broadcast-channel-sync`, `cal-com-booking`, `doku-payment`, `full-width-toggle`, `midtrans-payment`, `vector-search` — **6 of 15 contracts** still sit unadopted across all 5 audited consumers.

### Cross-consumer collisions (status update)

- **`comments`** — notion (diverged) + rahmanef (in-sync needs-adapter). UNCHANGED. **Coordinate UP-sync** before either pushes.
- **`mdx-blog` triangle** — content is now `up-needed · portable` + `bidirectional` ⇒ READY for `/rr-send`. rahmanef (`blog`, portable, slug-mismatched) and superspace (`blog`, consumer-locked plain-text) are still pending. **Negotiate contract first**: is `mdx-blog` MDX-only or generic content collection?
- **`audit-log`** — superspace (diverged needs-adapter) + rahmanef (in-sync portable as `audit`). UNCHANGED.
- **`admin`** — rahmanef (now `up-needed · portable`) + superspace (diverged consumer-locked as `platform-admin`). UNCHANGED scope split need.

## Top 10 prioritized actions (refreshed — 3 dropped, 7 remaining + 3 new follow-ups)

| Rank | Action | Owner | Status |
|---:|---|---|---|
| 1 | `/rr-prep ai-router --fix` then `/rr-send` from **superspace** | superspace | open · 6 seams · P0 |
| 2 | `/rr-prep audit-log --fix` then coordinate with rahmanef | superspace | open · 4 blockers · P0 |
| 3 | Coordinate `comments` blockers (notion + rahmanef) | notion + rahmanef | open · 7 unique blockers combined · P0 |
| **4** | ~~Refactor `command-menu` blockers from notion~~ | notion | **DONE** ✓ (SHA `068709c`) |
| **5** | ~~Refactor `mdx-blog` from content~~ | content | **DONE** ✓ (SHA `c6729a5`) |
| 6 | `document-checklist` from CareerPack | CareerPack | open · architectural mismatch — operator decision needed |
| **7** | ~~Refactor `seo` persona prop from rahmanef~~ | rahmanef | **DONE** ✓ (SHA `bde5763`) |
| **8** | ~~Refactor `admin` nav-from-registry from rahmanef~~ | rahmanef | **DONE** ✓ (SHA `b542389`) |
| 9 | Slug split `admin` (per-instance) vs `platform-admin` (multi-tenant) | kitab maintainer | open · scaffold scope |
| 10 | Stranded-slug review for the 6 unadopted | kitab maintainer | open · doc decision |

### New follow-ups from Wave N+3.1

| # | Action | Notes |
|---:|---|---|
| **11** | ~~`/rr-send mdx-blog` from kitab maintainer side~~ | **DONE** ✓ (Wave N+3.6) — kitab `mdx-blog@0.2.0` LANDED with `defineMdxBlog(opts)` factory + 4 config props. rahmanef.blog now eligible for DOWN-sync; superspace.blog still parked (consumer-locked plain-text). |
| 12 | `/rr-send seo` + `/rr-send admin` from rahmanef once kitab opens UP-sync slot | rahmanef has both portable + up-needed but `syncDirection: down-only` — flip to bidirectional after kitab maintainer signals readiness. |
| **13** | ~~Fix `npx rahman-resources scan-consumers` cache-path bug~~ | **DONE** ✓ (CLI 0.13.1, SHA `659c7fb`) · 4-tier KITAB_ROOT resolution (env > flag > walk-up cwd > __dirname fallback). |
| **14** | ~~Push UP `command-menu@0.3.0` from notion to kitab~~ | kitab maintainer | **DONE** ✓ (Wave N+3.7) — kitab `command-menu@0.2.0` LANDED with renderless `CommandPalette` + bindings-driven `SearchModal` + 8 vitest cases. notion adapters left consumer-side. |
| 15 | Decide adapter-scope split for notion's `adapters/nosion.*` (drop vs consumer-locked `nosion-command-palette` slice) | kitab maintainer + notion | open · keeps notion verdict permanently `up-needed` until resolved. |
| 16 | rahmanef.command-palette DOWN-sync to `command-menu@0.2.0` | rahmanef | open · contract API now stable — can adopt the renderless surface. |

## Consumer-only seed candidates (P4 — unchanged)

- rahmanef: `rate-limit`, `cta`, `contact`, `files`, `subscribers`, `testimonials` (6)
- superspace: `analytics`, `approvals`, `calendar`, `contacts`, `forms`, `import-export`, `kpi-thresholds`, `marketing`, `menus`, `reports`, `status`, `tasks` (12)

## Drift between scraped report and live `.kitab.json`

Verified live via `node packages/cli/bin/scan-consumers.mjs --consumer rahmanef|content`. Live state matches the markdown reports updated by Wave N+3.1 agents — no stale-report drift.

## Forbidden-terms scan (unchanged)

`npm run forbidden:terms` → `0 hits` last run on kitab side.

## Run history

| Date (UTC) | Action | Consumers scraped | Commit (kitab) | Author |
|---|---|---:|---|---|
| 2026-05-15 | initial aggregation | 5 (skipped cescadesigns) | `0ea2ff6` | claude-code |
| 2026-05-15 evening | Wave N+3.1 refresh — 3 portability refactors landed (rahmanef seo+admin, content mdx-blog) | 5 + live scan | `d4dbd37` | claude-code |
| 2026-05-15 late evening | Wave N+3.3 — command-menu portable + 3 kitab contract level shifts + scan multi-path | 5 + live scan | `0ccd403` | claude-code |
| 2026-05-15 late | Wave N+3.4 — comments@0.2.0 frontend + platform-admin scaffold | 5 + live scan | `01c5132` | claude-code |
| 2026-05-15 late | Wave N+3.5 — comments@0.2.0 Convex rebuild + audit-log@0.2.0 ship + 2 migration scripts + split proposal + content parse-error fix | 6 + live scan | `484ba2b` | claude-code |
| 2026-05-15 late late | Wave N+3.6 — mdx-blog@0.2.0 UP-sync ingest from content (defineMdxBlog factory + 4 props + 8 vitest cases) | 1 (mdx-blog) | (prev commit) | claude-code |
| 2026-05-15 late late late | Wave N+3.7 — command-menu@0.2.0 UP-sync ingest from notion (renderless CommandPalette + bindings-driven SearchModal + 8 vitest cases, dropped Nosion adapters) | 1 (command-menu) | (this commit) | claude-code |
