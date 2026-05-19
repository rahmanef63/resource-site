---
name: rr
description: Rahman Resources (rr) operator — context-aware skill for managing vertical slices across the rr monorepo and consumer projects. Detects cwd, runs the right verb. Replaces legacy /rr-prep, /rr-send, /rr-adopt skills (deleted 2026-05-16 with BSDL teardown).
---

# /rr — Rahman Resources operator skill

Global skill. Works from `/home/rahman/projects/resources/` (rr repo) AND from any consumer project. Detects context from cwd, then routes to the right action.

## When user invokes

- `/rr` — show status of current location (am I in rr or consumer? what's installed?)
- `/rr list` — show all available slices in rr catalog
- `/rr info <slug>` — full metadata for one slice
- `/rr add <slug>` — install slice from rr into consumer (or scaffold new in rr)
- `/rr update <slug>` — re-pull newer version (overwrite, warn on local edit)
- `/rr lift <slug>` — copy mature slice from consumer UP to rr (operator)
- `/rr changelog` — append a release entry covering current diff (mandatory before publish)
- `/rr publish` — bump CLI/MCP version + push + npm publish (operator, rr only)
- Natural language: "bawa fitur cv-generator dari CareerPack ke rr", "install command-menu ke project ini", "update audit-log"

## Step 1 — detect context

Run first:

```bash
pwd
test -d ./packages/cli && test -f ./CLAUDE.md && head -1 ./CLAUDE.md | grep -q "Rahman Resources" && echo "MODE: rr-repo" || echo "MODE: consumer"
```

Also check for sentinel files:
- **rr-repo mode** if cwd contains: `packages/cli/`, `frontend/slices/`, `CLAUDE.md` starts with "# CLAUDE.md — Rahman Resources"
- **consumer mode** if cwd contains: `slices/` (no `frontend/` prefix) OR `frontend/slices/` but NO `packages/cli/`
- **unknown** otherwise — ask user which mode

Show banner: `▸ /rr running in [rr-repo|consumer] mode — cwd=<path>`

## Step 2 — route by verb

### Verb: (none) — show status

**rr-repo mode:**
```bash
ls frontend/slices/ | grep -v _ | wc -l   # how many slices
grep -c "slug:" lib/content/slices.ts     # catalog entries
git log --oneline -5                      # recent activity
node packages/cli/scripts/validate-slice-parity.mjs 2>&1 | tail -3
```

**consumer mode:**
```bash
ls slices/ 2>/dev/null | head -20         # installed slices
ls shared/ 2>/dev/null | head -10         # cascaded shared
```

### Verb: list

```bash
npx rahman-resources list slices
```
(Or, if rr-repo mode and no internet: `grep slug: lib/content/slices.ts`)

### Verb: info <slug>

```bash
npx rahman-resources info <slug>
```

### Verb: add <slug>

**consumer mode:**
```bash
npx rahman-resources add <slug>
```
Then verify:
```bash
ls slices/<slug>/
test -f slices/<slug>/slice.json && echo "✓ installed"
```

**rr-repo mode (scaffold new slice):**
```bash
npx rahman-resources scaffold-slice <slug>
```

### Verb: update <slug>

**consumer mode:**
```bash
npx rahman-resources update <slug>
```
If conflicts (local edits), CLI warns. Operator decides: keep local OR overwrite.

### Verb: lift <slug> (consumer → rr)

**ONLY from consumer mode.** Promotes a mature slice from current consumer up to rr.

Pre-flight checklist (do BEFORE running):
1. Slice has no Clerk imports
2. Slice files all ≤200 LOC (audit-file-size hard gate)
3. No hardcoded consumer-specific terms (project name, business strings)
4. No cross-slice imports (must use `@/components/ui/*`, `@/shared/*`, or `@/features/<own-slug>/*`) — `@/components/templates/_shared/*` is an explicit cross-slice peer prefix allowed for slices that depend on template-shared primitives (CRUD, landing-sections, pages)
5. Convex tables (if any) prefixed `<slug>_*` with `by_workspace` index

Then:
```bash
# 1. Manual copy (the BSDL pipeline was torn down 2026-05-16; manual is the way)
SRC=$(pwd)/slices/<slug>           # or frontend/slices/<slug> per consumer convention
DST=~/projects/resources/frontend/slices/<slug>
cp -r "$SRC" "$DST"

# 2. Rewrite imports in rr-side copy if needed
# Example: replace consumer-specific aliases with rr-standard
# (do this with sed or Edit tool per file)

# 3. Add metadata if missing
cd ~/projects/resources/frontend/slices/<slug>
# Required: slice.json (slug, version, deps, paths)
# Recommended: slice.contract.ts (typed DSL)
# For CLI distribution: slice.manifest.json

# 4. Validate
cd ~/projects/resources
npm run audit:slices
npm run validate:all

# 5. Update catalog
# Edit lib/content/slices.ts — add SliceEntry for <slug>
# Regenerate manifest
cd packages/cli && node scripts/gen-manifest.mjs
cd ..

# 6. MANDATORY — append changelog entry (see Changelog discipline below)
# Edit lib/content/changelog.ts — add a release entry with bullet
# referencing { text: "<slug> — lifted from <consumer>", slug: "<slug>" }

# 7. Commit + push
git add frontend/slices/<slug> lib/content/slices.ts \
        packages/cli/lib/manifest.json lib/content/changelog.ts
git commit -m "feat(<slug>): lift from <consumer-name>"
git push origin main
```

If user wants the lift published as a new CLI version, also bump version (see `publish` verb).

### Verb: changelog (rr-repo mode)

**MANDATORY before publish.** Every wave/ship that touches a slice or
template needs an entry so consumers and the `/changelog` page can see
what changed and `<RecentlyUpdatedBadge>` lights up on detail pages.

Open `lib/content/changelog.ts` and prepend a new `ChangelogEntry`:

```ts
{
  id: "<wave-or-version>",          // anchor target — must match /changelog#<id>
  version: "<wave-or-version>",
  date: Date.parse("YYYY-MM-DD"),
  kind: "feature" | "improvement" | "fix" | "chore" | "breaking",
  title: "Short one-line summary",
  body: "Why-not-what paragraph. Cover the spirit of the wave.",
  groups: [
    {
      heading: "Slices touched",
      bullets: [
        { text: "<slug> — what changed", slug: "<slug>" },
      ],
    },
    {
      heading: "Templates touched",
      bullets: [
        { text: "<slug> — what changed", slug: "<slug>", kind: "template" },
      ],
    },
    {
      heading: "Site",
      bullets: [
        "Plain string for non-catalog notes (e.g. new helper added)",
      ],
    },
  ],
},
```

Schema rules:
- Bullet `{ text, slug }` (no `kind` field) defaults to `kind: "slice"` →
  links to `/slices/<slug>`. Set `kind: "template"` for layouts.
- `href` field can override the generated URL entirely (rare — for
  external docs links).
- Plain strings still work for items that don't map to a catalog entry.
- The `id` field becomes the `<RecentlyUpdatedBadge>` deep-link target
  via `/changelog#<id>` (scroll-mt-24 already wired).

After editing, verify:
```bash
npx tsc --noEmit 2>&1 | grep -v "lib/shared\|frontend/slices/mentions" | head
```

### Verb: publish (rr-repo mode only)

Operator-only. Bumps + publishes CLI and/or MCP to npm.

Before publishing — **ensure the changelog entry exists** for the
versions being published. CI does NOT enforce this yet but the
`<RecentlyUpdatedBadge>` will be wrong if you skip it.

```bash
# CLI
cd packages/cli
npm version <patch|minor|major> --no-git-tag-version
cd ../..
git add packages/cli/package.json && git commit -m "chore(cli): bump <new-version>"
git push origin main
cd packages/cli && npm publish --otp=...

# MCP (similar)
cd packages/mcp
npm version <patch|minor|major> --no-git-tag-version
cd ../..
git add packages/mcp/package.json && git commit -m "chore(mcp): bump <new-version>"
git push origin main
cd packages/mcp && npm publish --otp=...
```

User runs OTP step. Never run `npm publish` autonomously.

Version bump rules:
- **patch** — bugfix only, no API change
- **minor** — additive feature
- **major** — breaking: removed command/URI/flag, changed default behavior

---

## Changelog discipline (always apply)

Every PR/wave/lift that touches a catalog item MUST append a
`ChangelogEntry` in `lib/content/changelog.ts` BEFORE the commit lands
on main.

Why:
- `<RecentlyUpdatedBadge>` on `/slices/<slug>` and `/layouts/<slug>`
  reads `lib/content/changelog-helpers.ts::getLatestUpdate(slug, kind)`
  and shows "Updated 3d ago" → links to `/changelog#<releaseId>`.
- Without an entry, consumers can't tell what's fresh — they lose track
  of which slices/templates just got polished.

Pattern — one entry per ship, even tiny ones:

```ts
{
  id: "AO",                                // wave letter or version
  version: "AO-wave",
  date: Date.parse("2026-05-19"),
  kind: "fix",
  title: "Audit-log time formatter rounded down off-by-one",
  body: "Fix only — no API change.",
  groups: [{
    heading: "Slices touched",
    bullets: [
      { text: "audit-log — fmtRelative now uses Math.floor", slug: "audit-log" },
    ],
  }],
},
```

Quick check (before push):
```bash
grep "date: Date.parse" lib/content/changelog.ts | head -3   # newest first?
node packages/cli/scripts/gen-manifest.mjs                    # manifest still clean
npx tsc --noEmit 2>&1 | head                                  # types still happy
```

## Live preview SSOT (when adding new slices/templates with previews)

Both `/slices/[slug]` and `/layouts/[slug]` use the same docs-shell
tabbed UI (Code / Public / Split / Admin / Prompt). Single helper:

```ts
import { buildPreviewManifest } from "@/components/site/preview";

const manifest = buildPreviewManifest({
  title, subtitle,
  publicPath, adminPath,           // tabs conditional on presence
  defaultSurface, defaultView, defaultZoom,
  code: () => <CodeTab ... />,     // your code tab body
  prompt: () => <PromptTab ... />, // optional
  extras: [...],                   // additional tabs
  inspector, sourceRepo,
  config, composePrompt, composePreviewSrc,
});
useFeatureManifest(manifest);
```

When you ship a new slice with both `previewPath` + `adminPreviewPath`
in `lib/content/slices.ts`, the tabbed shell renders automatically —
no per-page wiring needed.

## Landing-sections schema (the canonical landing CRUD)

The `landing-sections` slice (also lives at
`components/templates/_shared/landing/` for rr-internal use) is the
SSOT for admin-editable landing pages.

`LandingSection` fields:
- `id`, `kind` (hero/features/pricing/blog/changelog/faq/portfolio/services/stats/newsletter/cta/testimonials/custom)
- `title`, `subtitle`
- `order` (1-based; list has up/down arrows)
- `enabled`
- `imageUrl` + `imageRatio` (16:9 default, dropdown)
- `bgImageUrl` (auto soft scrim for readability)
- `className` (custom Tailwind appended to section wrapper)
- `config` (JSON for kind-specific extras: `{badge}`, `{columns}`, `{limit}`)

DRY editor: every field defined ONCE in
`components/templates/_shared/landing/landing-fields.ts::LANDING_FIELDS`.
Both list-dialog and full-page editor consume it.

Per-template renderer pattern (every template's
`slices/home/LandingRenderer.tsx`):
```tsx
case "hero":
  return (
    <LandingSectionShell section={section}>
      <Hero ... image={section.imageUrl ? { url: section.imageUrl, ratio: section.imageRatio } : undefined} />
    </LandingSectionShell>
  );
```

When adding a new template: copy the pattern from any of the 7 existing
templates. Make sure `state.landingSections` is in your store with
sensible seed kinds (hero + features + cta minimum).

## VersionWatcher (client redeploy detection)

`components/system/VersionWatcher.tsx` polls `/api/version` every 5min
+ on focus/visibility. When deployed `BUILD_ID` differs from boot
`NEXT_PUBLIC_BUILD_ID`, sonner toast offers "Muat ulang" → hardReload
(CacheStorage purge + cache-buster query). Mounted in
`app/layout.tsx`.

`next.config.mjs` bakes `NEXT_PUBLIC_BUILD_ID` at build time (env id /
deployment id / Date.now fallback).

For new consumer projects: copy `components/system/VersionWatcher.tsx`
+ `app/api/version/route.ts` + the next.config snippet. Mount the
component near `<Toaster />`.

---

## Catalog snapshot (so other projects know what to check)

**Last refreshed: 2026-05-19.** Cross-check with rr repo before lift
work — counts drift weekly.

### Distributable slices (52)

Pure UI:
`blog-section`, `changelog-feed`, `cta`, `equation`, `faq-section`,
`feature-grid`, `hero`, `landing-sections`, `motion-primitives`,
`portfolio-section`, `pricing-page`, `responsive-dialog`, `services`,
`socials`, `subscribers`, `testimonials`, `testimonials-grid`,
`theme-preset-switcher`, `three-column`

Admin shells / infra:
`admin`, `admin-panel`, `audit-log`, `dashboard-shell`,
`event-tracking`, `full-width-toggle`, `notifications`,
`platform-admin`, `rate-limit`, `seo`

Editor primitives:
`code-block`, `command-menu`, `comments`, `database-cell-selection`,
`document-checklist`, `icon-picker`, `mdx-blog`

AI:
`ai-admin`, `ai-agents`, `ai-chat`, `ai-router`, `ai-studio`,
`vector-search`, `create-your-mcp`

Auth + payments:
`convex-auth`, `rbac-roles`, `doku-payment`, `midtrans-payment`,
`contact-form-resend`, `resend-newsletter`, `cal-com-booking`,
`broadcast-channel-sync`

### Website templates (7 of `os` family + `riset-kit`)

| Slug | Purpose |
|---|---|
| `saas-marketing-os` | Marketing site (pricing/features/blog/changelog) |
| `personal-brand-os` | Solo creator (hero/services/portfolio/blog/newsletter) |
| `agency-studio-os` | Agency/studio (clients/portfolio/services/leads) |
| `konsultan-os` | Consulting (projects/proposals/contracts/billing) |
| `kreator-studio-os` | Creator (content/newsletter/community/performance) |
| `wirausaha-os` | SMB (businesses/products/orders/finance/staff) |
| `riset-kit` | Research (documents/citations/ai-reader/lit-review/notes) |

All 7 share:
- Landing-sections admin↔public live-sync via BroadcastChannel
  (storageKey `<template>:state:v4-landing-sync` or later)
- `<LandingSectionShell>` wrapping every renderer kind (bgImage scrim +
  custom className via admin)
- CRUD entities use `<CrudListView>` + row-click `<CrudRowDialog>` with
  `<FieldDef>` schemas (image kind with aspect-ratio dropdown, wide
  fields, hints with examples)
- `<RecentlyUpdatedBadge>` on detail page header reading the changelog

### Layout snippets (cookbook layouts, 28)

Hero / pricing / accordion / blog catalogs at `/layouts/<slug>`.
Standalone JSX recipes (not full apps). See
`grep slug: lib/content/layouts.ts` for the full list.

---

## How other projects/agents should consume rr

When a consumer project sends data here (lift, harvest, sync, agent
ping), they need to:

1. **Check the catalog first** — run `npx rahman-resources list slices`
   OR scan the snapshot above. Don't duplicate an existing slice.
2. **Match the slug** — if their slice is conceptually the same as one
   in rr, use that exact slug. New name only when no overlap.
3. **Pre-flight before lift** — run the 5-point checklist above (no
   Clerk, 200-LOC cap, no consumer-specific strings, allowed imports,
   Convex prefixed).
4. **Provide changelog text** — the lifting operator MUST add an entry
   to `lib/content/changelog.ts` naming their slug. Bullet shape:
   `{ text: "<slug> — <what-changed-in-1-line>", slug: "<slug>" }`.
   Without this the badge won't show on /slices/<slug>.
5. **Mention if there's a peer** — if their slice depends on another
   rr slice (e.g. landing-sections needs CRUD shell), declare it in
   `slice.contract.ts` under `requires.peers` with `range` + `reason`.

When AGENTS run against rr from outside:
- Source of truth for catalog: `lib/content/slices.ts` (export
  `slices`) + `lib/content/layouts.ts`.
- Source of truth for changelog: `lib/content/changelog.ts` (export
  `releases`).
- Helper: `lib/content/changelog-helpers.ts::getLatestUpdate(slug, kind)`
  → returns latest entry referencing the slug.
- Recently-shipped lookup: `isRecentlyUpdated(slug, kind, windowDays=14)`.

---

## Source map per consumer (for lift verb)

Slice directory differs slightly per consumer. Detect from cwd:

| Consumer | Slice base | Notes |
|---|---|---|
| `superspace` | `frontend/slices/` | Largest (51 slices) — mostly business-locked |
| `notion-page-clone` | `frontend/slices/` | 35 slices — biggest harvest opportunity |
| `rahmanef.com` | `frontend/slices/` | 26 slices — many portable UI primitives |
| `content-rahmanef-com` | `frontend/slices/` | 11 slices, pure rr consumer |
| `CareerPack` | `frontend/src/slices/` | **Note**: extra `src/` segment |
| `cescadesigns` | (none yet) | Repo not yet sliced — defer harvest |
| `rc-samata-dash` | `src/shared/components/` | VersionWatcher pattern source |

## Hard rules (always apply, never skip)

1. **No Clerk** — auth = `@convex-dev/auth` (rr mandate)
2. **shadcn-only UI** — raw `<button>`, `<dialog>`, native `<input type=date|file>` forbidden
3. **Copy-first, never greenfield** — for new slice, always start from cp -r of source
4. **Solo dev → push direct to main**, never open PR (see global rule in ~/.claude/CLAUDE.md)
5. **No .kitab.json** — BSDL is dead. If you see `.kitab.json` in any project, delete it.
6. **No term "kitab"** in new code/docs — say "rr" or "Rahman Resources"
7. **200-LOC file cap** — audit-file-size hard gate. Refactor into sub-files when crossing.
8. **bare .collect() forbidden** in Convex queries — use `.withIndex(...).take(N)`.
9. **Public Convex fn MUST have `args` validator** — audit-bp P0.
10. **Changelog entry required** when touching a catalog item before push (see Changelog discipline above).

## Output format

Always end with caveman bahasa Indonesia recap (per global feedback):
- What changed
- Where to look
- What NOT to expect

## Compat note

This skill REPLACES three deleted skills (removed 2026-05-16 with BSDL teardown):
- `/rr-prep` (was: preflight slice for harvest) → now folded into `lift` verb pre-flight checklist
- `/rr-send` (was: BSDL bidir send) → now folded into `lift` verb (manual cp-r flow)
- `/rr-adopt` (was: migrate to rahman-shared npm) → now: if user wants, just `pnpm add rahman-shared` directly, no skill needed
