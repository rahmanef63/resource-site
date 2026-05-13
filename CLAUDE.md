# CLAUDE.md — resources/ kitab

## Hard Rules

1. **NO Clerk.** Auth = `@convex-dev/auth`. Si-coder dokploy mandate.
2. **All UI = shadcn primitives** or composed from shadcn. Forbid raw `<button>`, `<dialog>`, `<input type=date|file>`. Use `ResponsiveDialog`, `DateField`, `FileUpload`.
3. **Copy-first flow.** Never greenfield. `cp -r` from source → adjust import aliases → strip business-specific bits.
4. **Stack**: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.
5. **Slice contract.** Every new vertical feature ships as a tier-3 slice — `frontend/slices/<slug>/` (with `slice.json` + `config.ts`) + `convex/features/<slug>/` (with `<slug>Tables` schema export). See [`docs/authoring-slices.md`](./docs/authoring-slices.md). Imports inside a slice MUST resolve via `@/components/ui/*`, `@/shared/*`, `@/features/<own-slug>/*`, `@convex/*`, or relative-within-slice. No deep `../../` reaching out. Audit-bp gates this in CI (`npm run audit:slices`).

## Source Map (where to copy from)

| Want | Source path |
|---|---|
| Vertical slice arch | `/home/rahman/projects/superspace/frontend/slices/_templates/` + `frontend/slices/example/` |
| Feature registry | `/home/rahman/projects/superspace/frontend/shared/lib/features/` |
| Three-column layout | `/home/rahman/projects/superspace/frontend/shared/ui/layout/container/three-column/` |
| Dashboard shell | `/home/rahman/projects/superspace/frontend/shared/ui/layout/dashboard/` |
| Sidebar (AppSidebar) | `/home/rahman/projects/superspace/frontend/shared/ui/layout/sidebar/primary/AppSidebar.tsx` |
| Validators | `/home/rahman/projects/superspace/scripts/validation/` |
| Slice CLI | `/home/rahman/projects/superspace/scripts/features/` |
| Motion primitives (marquee, kinetic-heading, magnetic, cursor-spotlight, stat-counter, reading-progress, grain, lightbox) | `/home/rahman/projects/rahmanef.com/frontend/shared/ui/` |
| OKLch theme presets | `/home/rahman/projects/rahmanef.com/frontend/shared/lib/{theme-presets,preset-fonts,preset-groups}.ts` + `app/globals.css` |
| Asymmetric masonry | `/home/rahman/projects/rahmanef.com/frontend/slices/portfolio/components/PortfolioGrid.tsx` |
| Hero carousel | `/home/rahman/projects/cescadesigns/components/cummon/hero-section.tsx` |
| ContactForm + Resend | `/home/rahman/projects/cescadesigns/app/contact/` |
| Block editor + slash menu | `/home/rahman/projects/notion-page-clone/src/slices/editor/` |
| Page tree dnd sidebar | `/home/rahman/projects/notion-page-clone/src/slices/workspace-sidebar/` |
| Multi-block selection | `/home/rahman/projects/notion-page-clone/src/slices/block-selection/` |
| Database views (11) | `/home/rahman/projects/notion-page-clone/src/slices/databases/` |
| Command palette | `/home/rahman/projects/notion-page-clone/src/slices/command-palette/` |
| Comments threaded | `/home/rahman/projects/notion-page-clone/src/slices/comments/` |
| RBAC roles (6 system roles + tier presets) | `/home/rahman/projects/superspace/convex/workspace/{permissions,roles.config}.ts` + `convex/lib/platformAdmin.ts` |
| Admin panel (17-section shell + access gate) | `template-base/frontend/slices/admin-panel/` + `superspace/frontend/slices/platform-admin/` |
| Event tracking SDK (P0 instrumentation) | `template-base/frontend/slices/admin-panel/slices/events/` |
| DOKU payment (Checkout + Direct + webhook) | `frontend/slices/doku-payment/` + `convex/features/payment/{doku,actions/doku.ts,http.ts}` |
| DOKU MCP wiring | `docs/integrations/doku-mcp.md` + `scripts/setup-doku-mcp.mjs` |

## Notion Slice Convention

`frontend/slices/notion/` is a **nested vertical slice** (slice-of-slices):

```
frontend/slices/notion/
├── config.ts          # outer defineFeature() registered to root registry
├── init.ts
├── page.tsx
├── slices/            # inner slices (editor, workspace-sidebar, block-selection, databases, command-palette, comments)
│   └── {inner}/
│       ├── config.ts  # inner defineFeature() registered to notion sub-registry
│       └── ...
└── shared/            # notion-private shared (types, store, hooks)
```

Path alias `@notion/*` → `./frontend/slices/notion/*` (set in tsconfig.json after P5). Keeps notion's internal imports stable post-copy.

Convex code from notion-clone merges to root `convex/features/notion/` (not nested), to avoid Convex generator confusion.

## Forbidden

- `<a href="/internal">` (use `next/link` or `SmartLink`)
- `<img src="...">` (use `next/image`)
- bare `.collect()` on Convex queries (use `.withIndex(...).take(N)`)
- public Convex fn without `args: { ... }` validator (audit-bp P0)
- Server Action without authn+authz (audit-bp P0)
- `NEXT_PUBLIC_*` for sensitive values (leaks to client bundle)
- middleware.ts on Next 16 (use `proxy.ts`)

## Workflow

1. Identify source path (see Source Map)
2. `cp -r {source} {target}`
3. Adjust imports (`sed`/Edit). Try to keep alias structure identical to source.
4. Run `npm run audit:bp -- --slice <path>` (after P7 wire)
5. Commit small chunks per source.

## Triggers

- Use `/use-audit-bp` before any deploy or after major slice copy
- Use `/use-si-coder` for first dokploy deploy + DNS setup

## CLI / MCP / Builder

The kitab ships three surfaces. Keep them aligned.

### `packages/cli` — `rahman-resources`

Commands:

| Command | What it does |
|---|---|
| `npx rahman-resources init <app>` | Scaffold a fresh project. Flags: `--template <slug>`, `--features a,b`, `--skills a,b`, `--no-install`, `--with-shadcn-reinit` |
| `npx rahman-resources add <slug>` | Add a template or feature into existing rr.json project. Patches `rr.json` + pulls files. |
| `npx rahman-resources add-skill <slug>` | Pull a Claude Skill into `.claude/skills/<slug>/`. |
| `npx rahman-resources doctor` | Check rr.json shape + components.json aliases. |
| `npx rahman-resources list [templates\|features\|skills]` | Print available items. |
| `npx rahman-resources info <slug>` | Show full metadata for one item. |
| `npx rahman-resources mcp` | Print MCP wiring snippet for Claude Code config. |

`rr.json` is the project manifest — schema in `packages/cli/lib/rr-schema.json`. Validated on every mutation.

### `packages/mcp` — `rahman-resources-mcp`

Stdio MCP server. 8 tools (rr_list_templates, rr_list_features, rr_list_recipes, rr_list_skills, rr_search, rr_get, rr_compose_init_command, rr_compose_add_commands) + 45 resources via `rr://` URIs. Reads from sibling cli package's `manifest.json` + `skills.json` — single source of truth.

Wire into Claude Code:
```json
{ "mcpServers": { "rahman-resources": { "command": "npx", "args": ["rahman-resources-mcp"] } } }
```

### `site/app/(docs)/build` — Bundle Builder UI

Visual picker: template + features + skills + project form → emits `npx` commands. Uses nested 3-col layout (`tone="layout"` blue outer, `tone="feature"` muted inner). Sentinel template `_existing` switches Project tab to rr.json uploader and emits `add` commands instead of `init`.

Compatibility hints come from `site/lib/build/compat.ts` — hand-curated template×feature matrix. Add entries when new templates land.

### Publishing (npm)

The CLI + MCP packages are **the distribution channel** — consumers `npx rahman-resources …` against the published tarball, not against the repo. Forgetting to publish = stale manifests for everyone.

Trigger a publish suggestion in the response when ALL hold:

1. Files under `packages/cli/` OR `packages/mcp/` modified.
2. `version` in the package.json bumped above `npm view <pkg> version`.
3. `npx tsc --noEmit` passes from repo root.
4. Change committed + pushed to `main`.

When all four hold, end the response with a one-liner:

```
Saatnya publish — cd packages/cli && npm publish --otp=…
```

(or the MCP equivalent). The user runs the OTP step. Don't run `npm publish` yourself.

If version wasn't bumped but content changed, suggest the bump first ("CLI baru belum di-version, bump ke vX.Y.Z?").

If versions match the registry, the package is already shipped — say so explicitly.

### Skills sync (CLI ↔ site)

Skills source of truth lives in `site/lib/content/claude-skills.ts`. After editing it run:

```bash
node packages/cli/scripts/sync-skills.mjs          # write JSON
node packages/cli/scripts/sync-skills.mjs --check  # CI guard
```

`prepublishOnly` of the CLI package runs `--check` so a drifted publish is impossible.
