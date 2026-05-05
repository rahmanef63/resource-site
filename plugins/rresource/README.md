# rresource

General-purpose template installer for Claude Code.

Each skill scaffolds one primitive / layout / recipe / feature into the
active project — runs cp commands, applies schema additions, installs
deps, registers nav, runs the R1..R17 verification checklist.

> **Scope discipline:** primitives are domain-agnostic. CareerPack
> served as donor source for several lifts (file-upload, rate-limit,
> audit-log) but no career-specific skills (cv-generator,
> mock-interview, financial-calculator, …) ship in this plugin.

## Install (in consumer's Claude Code session)

```
/plugin marketplace add rahmanef63/resource-site
/plugin install rresource@resource-site
```

Then any skill is invokable as `/rresource:<id>`.

## Skill catalog (51 total)

### Primitives (18) — domain-agnostic
`pdf-generator` · `ai-translate` · `kanban-board` · `data-table` ·
`markdown-editor` · `csv-import-export` · `image-crop` · `rate-limit` ·
`audit-log` · `feedback-widget` · `email-pipeline` ·
`analytics-dashboard` · `public-profile` · `oauth-providers` ·
`i18n-switcher` · `seed-bootstrap` · `form-builder` · `ocr`

### Layouts (8)
`3column` · `hero-carousel` · `asymmetric-masonry` · `bento` ·
`kinetic-text` · `ide` · `mobile-dock` · `cms-storefront`

### Recipes (8)
`block-editor` · `page-tree-sidebar` · `multi-block-selection` ·
`database-views` · `command-palette` · `comments-threaded` ·
`theme-preset-switcher` · `contact-form-resend`

### Features (17) — general dashboard slices
`admin` · `admin-panel` · `ai-agent` · `ai-settings` · `auth` ·
`calendar` · `dashboard-home` · `database` · `file-upload` · `help` ·
`hero` · `library` · `notifications` · `pwa` · `responsive-shell` ·
`settings` · `theme-preset`

## Architecture

```
plugins/rresource/
├── .claude-plugin/plugin.json
├── README.md
├── SHARED.md                    porting baseline (R1..R17, schema rules, nav)
├── cookbook/
│   ├── primitives/<id>.md       18 docs — general primitives
│   ├── features/<id>.md         17 docs — general dashboard slices
│   ├── layouts/<id>.md          8 docs
│   └── recipes/<id>.md          8 docs
└── skills/<id>/
    ├── SKILL.md                 agent run protocol
    └── src/                     vendored source (modular, self-contained)
        ├── README.md            per-skill install
        ├── lib/                 pure helpers
        ├── hooks/use<X>.ts      localStorage state (DEFAULT)
        ├── components/<X>.tsx   React UI
        ├── convex/<X>.ts        OPTIONAL Convex schema + fns
        └── styles/              optional CSS
```

## State management policy

**Default = localStorage.** Every stateful primitive ships a
`use<X>Local` hook backed by `window.localStorage`. Slice works
**standalone, no Convex required**.

**Real persistence = opt-in Convex.** Each slice that needs server
state ships a `convex/<x>.ts` with:
- Commented schema fragment (paste into target's `convex/schema.ts`)
- `query` + `mutation` functions following R4 (`requireUser`,
  `requireOwnedDoc`, no bare `.collect()`).

To upgrade: copy `convex/` files → add schema fragment → run
`pnpm backend:dev-sync` → swap `use<X>Local` for `useQuery`/`useMutation`.

## Modular by design

Each skill folder is downloadable in isolation. NO cross-skill imports.
Slight code duplication (e.g. localStorage helper appears in multiple
slices) is intentional — it preserves the "drop one folder, get a
working feature" guarantee.

## Vendored vs doc-only

| Bundled `src/` (works as-is) | Doc-only (cp from upstream lift) |
|---|---|
| All 18 primitives | 17 features |
| theme-preset-switcher (recipe) | 7 other recipes |
| (none yet) | 8 layouts |
| | |
| → drop folder, install deps, mount | → see SKILL.md cp protocol |

Each `SKILL.md` instructs the agent to:

1. Read `SHARED.md` once per project (baseline check).
2. Read the bundled `cookbook/<kind>/<id>.md` spec.
3. Resolve path aliases for the consumer repo.
4. Run cp commands from listed lift sources.
5. Apply schema additions (additive only, `v.optional`, `by_user`).
6. Install npm deps.
7. Wire env vars.
8. Register nav (if dashboard slice).
9. Run R1..R17 verification.
10. Stop and confirm before commit.

## Lift sources (read-only — never modified)

| Repo | What is lifted from it |
|---|---|
| `~/projects/CareerPack` | file-upload, rate-limit, audit-log, feedback-widget, seed-bootstrap, ai-translate, image-crop, analytics-dashboard, public-profile, kanban-board, pdf-generator |
| `~/projects/cescadesigns` | hero-carousel, contact-form-resend, email-pipeline, data-table |
| `~/projects/rahmanef.com` | asymmetric-masonry, kinetic-text, theme-preset-switcher, motion primitives |
| `~/projects/notion-page-clone` | block-editor, page-tree-sidebar, multi-block-selection, database-views, command-palette, comments-threaded |
| kitab-core (private) | 3column, mobile-dock, cms-storefront |

## Source vendoring status

| Status | Templates |
|---|---|
| **Vendored** (source in plugin) | `3column`, `hero-carousel` (live previews bundled in `components/previews/`) |
| **Doc-only** (cp from upstream repo on lift path) | All others |

When upstream is missing, the skill tells the user where to mount it
OR scaffolds a minimal stub from the spec's example code.

## Hard rules

See `SHARED.md` §11 (R1..R17). Most-violated:

- NO Clerk / NextAuth — auth = `@convex-dev/auth` only.
- NO raw `<button>` / `<input type=date|file>` / `<dialog>` — use shadcn.
- NO `<a href="/internal">` — use `next/link`.
- NO `<img src="...">` — use `next/image`.
- NO bare `.collect()` — use `.withIndex(...).take(N)`.
- NO public Convex fn without `args` validator.
- NO Server Action without `requireUser` + ownership check.
- NO `NEXT_PUBLIC_*` for sensitive values (Resend key, OAuth secrets).
- NO `middleware.ts` on Next 16 — use `proxy.ts`.
- NO Scrypt — PBKDF2-SHA256 100k iter only.
