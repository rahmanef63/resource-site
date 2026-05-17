# resource.rahmanef.com — public site

Public showcase for the [Rahman Resources](https://github.com/rahmanef63/resources) monorepo (`rr`).

- shadcn-style sidebar layout
- Per-layout & per-recipe pages with Preview / Code / Install tabs
- `/llms.txt` + `/api/knowledge` for AI agents
- "Install with Agent" prompt builder (copy → paste into Claude Code / Cursor)

```
resources/
├── template-base/   # canonical copy-from template (lean)
├── cookbook/        # opinionated layout variants (landing, dashboard)
├── recipes/         # feature drop-ins (block-editor, command-palette, ...)
├── site/            # Next 16 site — rr browser + Bundle Builder (/build)
├── packages/
│   ├── cli/         # `rahman-resources` (alias `resources`) — npx scaffolder + add + lift
│   └── mcp/         # `rahman-resources-mcp` — stdio MCP for Claude Code / agents
└── docs/            # rr docs (slice authoring, etc)
```

Next.js 16 + React 19 + Tailwind 4 + shadcn/ui. No backend.

## Install (consumers)

```bash
# Scaffold a fresh Next 16 + React 19 + Tailwind 4 + Convex + shadcn app
npx rahman-resources@latest init my-app

# With every shadcn primitive pre-baked:
npx rahman-resources@latest init my-app --with-shadcn-all

# With a full-app template (public + admin route trees):
npx rahman-resources@latest init my-app --template personal-brand-os
```

Cross-platform — macOS / Linux / Windows PowerShell + WSL.

## Dev (this repo, for contributors)

```bash
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000.

```json
{ "mcpServers": { "rahman-resources": { "command": "npx", "args": ["rahman-resources-mcp"] } } }
```

8 tools (rr_list_*, rr_search, rr_get, rr_compose_*) + `rr://` resources. See `packages/mcp/README.md`.

## Bundle Builder

Visual picker at `site/app/(docs)/build` — pick template + features + skills, copy the emitted `npx` commands, ship. See `CLAUDE.md` § "CLI / MCP / Builder" for the full surface.

## Stack Lock

- Next.js 16 (App Router + Cache Components)
- React 19
- Tailwind CSS 4
- shadcn/ui (mandatory for all components)
- Convex self-hosted + `@convex-dev/auth` (no Clerk)
- TypeScript strict
- Dokploy deploy via `/use-si-coder`
- Best-practice gate via `/use-audit-bp`

## Source References (read-only)

| Source | Purpose |
|---|---|
| `/home/rahman/projects/superspace/` | foundation: vertical slice arch, layouts, registry, validators, **studio** (UI builder + workflow automation, archived in source) |
| `/home/rahman/projects/rahmanef.com/` | motion primitives, OKLch theme presets, asymmetric masonry, route groups |
| `/home/rahman/projects/cescadesigns/` | hero carousel, ContactForm + Resend |
| `/home/rahman/projects/notion-page-clone/` | block editor, slash menu, db views (Vite — port to Next.js App Router) |

## Build Phases

| # | Phase | Status |
|---|---|---|
| P1 | scaffold dirs | done |
| P2 | copy superspace foundation (lean, no business slices) | done |
| P2.5 | rip Clerk → @convex-dev/auth (clerk-shim + canonical infra) | done |
| P2.6 | Next 15 → 16 migration (cacheComponents, proxy.ts, instrumentation) | done |
| P3 | lift rahmanef motion + theme | done |
| P4 | lift cescadesigns carousel + contact | done |
| P5 | copy notion → `frontend/slices/notion/` (full Vite→Next port deferred — see PORT-NOTION.md) | done |
| P6 | si-coder dokploy wire (Dockerfile + docker-compose + .env.example + deploy.md) | done |
| P7 | audit-bp wire (npm scripts + audit.md gate spec) | done |
| P8 | slice docs generator (`pnpm generate:slice-docs`) | done |
| P9 | cookbook layout variants (8 README stubs) + recipes (8 README stubs) | done |
| P10 | studio extraction (UI builder + workflow automation slice from superspace@aeced78a) | done — beta, see `template-base/frontend/slices/studio/EXTRACTED.md` |

## Next Steps

1. `cd template-base && npm install --yes --legacy-peer-deps`
2. `npx convex dev --once` to generate `convex/_generated` (overwrites the temporary stubs landed by P10)
3. `git add convex/_generated && git commit`
4. `npm run typecheck` — expect import errors, fix progressively (notion still needs port — see `PORT-NOTION.md`; studio has 51 stabilization-class errors, see `frontend/slices/studio/EXTRACTED.md`)
5. `npm run audit:bp -- --full`
6. Deploy via `node $HOME/.agents/skills/si-coder/scripts/deploy.js ...` — see `docs/deploy.md`

See `docs/architecture.md` for rationale, `docs/studio-extraction.md` for the studio slice contract.
