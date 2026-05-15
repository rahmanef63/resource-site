# KitabSync Aggregate Report

> Generated: 2026-05-15
> Source: scrape of `<consumer-repo>/docs/kitabsync.md` × 5 consumers
> Skipped: cescadesigns (operator decision — minimal overlap expected)
> Kitab snapshot ref: `de7411b`

## Per-consumer roll-up

| Consumer | Adopted | Verdict mix | Generalization mix | Top P0 |
|---|---:|---|---|---|
| **CareerPack** | 1 | in-sync=1 · kitab-only=14 | needs-adapter=1 | `document-checklist` UP-sync prep (5 blockers) |
| **notion-page-clone** | 2 | diverged=2 · consumer-only=33 · kitab-only=6 | needs-adapter=2 | `comments` + `command-menu` both diverged |
| **rahmanef.com** | 6 | in-sync=6 · consumer-only=20 · kitab-only=9 | portable=2 · needs-adapter=4 | `comments`, `seo` refactor |
| **content-rahmanef-com** | 3 | in-sync=3 · consumer-only=5 · kitab-only=4 | portable=2 · needs-adapter=1 | `mdx-blog` parameterise (5 blockers) |
| **superspace** | 4 | diverged=4 · consumer-only=46 · kitab-only=11 | needs-adapter=2 · consumer-locked=2 | `ai` (P0) + `audit-log` (P0) |
| **TOTAL** | **16 manifests** | — | portable=6 · needs-adapter=10 · consumer-locked=2 | — |

## Cross-consumer slug matrix

Reads as: `verdict · generalization` (alias in parens when consumer renamed the slug).

| Kitab slug | CareerPack | notion | rahmanef | content | superspace |
|---|---|---|---|---|---|
| `admin` | kitab-only | kitab-only | in-sync · needs-adapter | kitab-only | diverged · consumer-locked (as `platform-admin`) |
| `ai-router` | kitab-only | kitab-only | kitab-only | kitab-only | **diverged · needs-adapter** (as `ai`) |
| `audit-log` | kitab-only | kitab-only | in-sync · portable (as `audit`) | kitab-only | **diverged · needs-adapter** |
| `broadcast-channel-sync` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `cal-com-booking` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `comments` | kitab-only | **diverged · needs-adapter** | in-sync · needs-adapter | kitab-only | kitab-only |
| `convex-auth` | kitab-only | kitab-only | in-sync · needs-adapter (frozen — PBKDF2 lock as `auth`) | in-sync · portable | kitab-only |
| `document-checklist` | in-sync · needs-adapter | kitab-only | kitab-only | kitab-only | kitab-only |
| `doku-payment` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `full-width-toggle` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `mdx-blog` | kitab-only | kitab-only | in-sync · portable (as `blog`) | in-sync · needs-adapter | **diverged · consumer-locked** (as `blog`, plain-text) |
| `midtrans-payment` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |
| `resend-newsletter` | kitab-only | kitab-only | kitab-only | in-sync · portable | kitab-only |
| `seo` | kitab-only | kitab-only | in-sync · needs-adapter | kitab-only | kitab-only |
| `vector-search` | kitab-only | kitab-only | kitab-only | kitab-only | kitab-only |

### Stranded slugs (no consumer adoption)

`broadcast-channel-sync`, `cal-com-booking`, `doku-payment`, `full-width-toggle`, `midtrans-payment`, `vector-search` — **6 of 15 contracts** sit unadopted across all 5 audited consumers. Operator decision required: keep, mark as operator-only, or retire.

### Cross-consumer collision

- `comments` — both notion (diverged) and rahmanef (in-sync) declare needs-adapter. **Coordinate UP-sync** or one will overwrite the other's blockers list.
- `mdx-blog` triangle:
  - rahmanef (`blog`) — portable, slug-mismatched
  - content (`mdx-blog`) — needs-adapter, 5 concrete blockers
  - superspace (`blog`) — consumer-locked (plain-text, NOT MDX)
  - Need contract negotiation: is `mdx-blog` MDX-only, or generic content-collection?
- `audit-log` — superspace (diverged · `audit-log` slug) + rahmanef (in-sync portable, `audit` slug). Coordinate.
- `admin` — rahmanef (in-sync needs-adapter) + superspace (diverged consumer-locked as `platform-admin`). Different scopes — superspace's is platform admin, rahmanef's is per-instance admin. Likely needs slug split (`admin` + `platform-admin`).

## Top 10 prioritized actions

| Rank | Action | Owner | Blockers | Outcome |
|---:|---|---|---:|---|
| 1 | `/rr-prep ai-router --fix` then `/rr-send` from **superspace** | superspace | 6 (3 trivial extractions) | Kitab `ai-router` becomes consumer-tested; widest cross-consumer demand |
| 2 | `/rr-prep audit-log --fix` then coordinate with rahmanef | superspace | 4 (logAuditEvent shape primary) | Two consumers converge on a single audit contract |
| 3 | Refactor `comments` blockers (notion + rahmanef coordinate) | notion + rahmanef | 7 unique blockers combined | Polymorphic comments contract unblocked for both |
| 4 | Refactor `command-menu` blockers from notion | notion | 5 (groups/onNavigate/labels/slots) | Generic command palette ready for kitab |
| 5 | Refactor `mdx-blog` 5 blockers from content | content | 5 (basePath/labels/contentDir) | Then negotiate MDX-vs-plain with superspace.blog |
| 6 | `/rr-prep document-checklist --fix` from **CareerPack** | CareerPack | 5 (auth-scope, table-shape, raw-button, hardcoded-copy, deep-import) | First adopted slice ready for /rr-send |
| 7 | Refactor `seo` persona prop from rahmanef | rahmanef | 1 (SYSTEM_PROMPT hoist) | Quick win — 1 blocker only |
| 8 | Refactor `admin` nav-from-registry from rahmanef | rahmanef | 1 | Single blocker; complements platform-admin scope split |
| 9 | Slug split: `admin` (per-instance) vs `platform-admin` (multi-tenant control plane) | kitab maintainer | n/a | Resolves rahmanef ↔ superspace conflict |
| 10 | Stranded-slug review: keep/operator-only/retire for the 6 unadopted | kitab maintainer | n/a | Cleans `bidir.syncPolicy` to reflect reality (`frozen` for retired) |

## Consumer-only seed candidates (P4 — promote UP to kitab)

Quick-scan portable from consumer reports:

| Consumer | Slice | Why portable |
|---|---|---|
| rahmanef | `rate-limit` | Generic per-key counter, fresh refactor |
| rahmanef | `cta` | No persona strings |
| rahmanef | `contact` | Form + table, no persona |
| rahmanef | `files` | `ctx.storage.*` wrapper, configurable WebP |
| rahmanef | `subscribers` | Newsletter list + attribution |
| rahmanef | `testimonials` | No persona strings |
| superspace | `analytics`, `approvals`, `calendar`, `contacts`, `forms`, `import-export`, `kpi-thresholds`, `marketing`, `menus`, `reports`, `status`, `tasks` | Structurally generic; need `/rr-prep` to confirm against workspace-isolation patterns |

## Schema compliance

All 5 reports use the canonical anchors from `docs/kitabsync-report-template.md`. Run-history table populated in all 5 (initial bootstrap + audit refresh rows). Kitab snapshot ref consistent (`de7411b`).

## Drift between scraped report and live `.kitab.json`

Not run yet. Next iteration: cross-check via `npm run scan:consumers --json` and surface any consumer where the markdown report disagrees with the actual `.kitab.json` field values (stale report = needs refresh).

## Forbidden-terms scan

Last run on kitab side: `npm run forbidden:terms` → `0 hits` (post comment-only-line patch). Cross-provider gates intact.

## Run history

| Date (UTC) | Action | Consumers scraped | Commit (kitab) | Author |
|---|---|---:|---|---|
| 2026-05-15 | initial aggregation | 5 (skipped cescadesigns) | (this commit) | claude-code |
