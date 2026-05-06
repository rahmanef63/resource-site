# Kitab Progress Log

Chronological session log. Each entry is dated and lists what landed + outstanding work.

## 2026-05-06 — Autonomous remediation session

### Outcome

| Surface | Before | After |
|---|---|---|
| Deployed kitab Docker build | ❌ failing on `cookbook/`/`recipes/`/`template-base/` typecheck | ✅ green, 120 prerendered routes |
| Docker build context | 14.95 MB | 1.4 MB (10.7× smaller) |
| Studio extraction tsc errors | 53 | **0** |
| Template-base internal tsc errors | 1108 | **207 (−81%)** |
| `"latest"` deps in package.json | 79 (root + template-base) | 0 |
| High-severity npm vulns (CLI) | 4 (tar via tiged) | **0** |
| GitHub Actions CI | none | typecheck + build + audit gate |

### npm registry

- `rahman-resources@0.4.2` ✅ live
- `rahman-resources@0.4.3` ⏸️ committed locally (overrides + script fixes), awaiting `npm publish --otp=…`
- `rahman-resources-mcp@0.1.0` ✅ live, smoke-tested (8 tools)

### What landed (commits to main, in order)

1. `fix(build): exclude kitab pull-source dirs from typecheck + docker context` — root tsconfig + new `.dockerignore` + dropped dead `lint` script.
2. `chore(docker): also exclude convex/, plugins/, docs/`.
3. `fix(studio): land all 53 stabilization-class tsc errors` — schema additions (tasks, cms_collections, dbTables, dbRows, documents), unified notifications schema, builder enum widening, testing-library imports, misc.
4. `chore: pin latest deps + fix tar high vuln + repair sync-skills paths` — 79 specs pinned, npm overrides force `tar@^7.5`, sync-skills + parse-content scripts adjusted for the post-restructure root layout.
5. `chore(template-base): -680 tsc errors via schema + registries + peer deps + path fixes` — 6 cross-feature shared schemas composed, 4 auto-generated registries regenerated, 37 peer deps installed, sed fixes for notion `_generated` paths and `@/shared/lib/cn` alias.
6. `chore: remove registry.tsx.backup committed by mistake`.
7. `chore(.gitignore): exclude *.backup files`.
8. `ci: add typecheck + build + audit GitHub Actions workflow`.
9. `fix(template-base): backfill from superspace + stub libs (-135 tsc errors)` — auth/RBAC + audit schemas backfilled, workspace + invitations + mock-data + hooks/components copied, generic `use-file-upload` / `image-convert` / `auth-context` stubs created.
10. `fix(template-base): selective backfill chat/ai/menus/social/database (-86 tsc errors)` — comprehensive feature schemas composed into root, `industryTemplates`, `invitations`, `workspaceLinks`, `systemNotifications`, `exampleItems` selectively spread.

### Critical fixes

**Docker build failure root cause** — Next 16 type-checks every TS/TSX matching tsconfig include. After PR #2 landed `cookbook/`, `recipes/`, `template-base/`, `packages/` at root, their Convex-using example code fed into typecheck and the deploy died on:

```
./cookbook/layouts/landing-asymmetric-masonry/src/PortfolioGrid.tsx
Type error: Cannot find module 'convex/react'
```

The deployed showcase site has no `convex` dep — it's a static catalog UI. Fix: those dirs are pull-source for the CLI (`tiged` pulls them into projects scaffolded via `rahman-resources init`), not deployed-app code. tsconfig + .dockerignore now exclude them.

**Tar vuln eliminated** — `tiged@2.12.7` pulled `tar@6.2.1`, vulnerable to hardlink-path-traversal CVE. `npm overrides` force `tar@^7.5`; tiged uses only `tar.extract` which has the same shape in v7. Smoke-tested tiged still pulls files end-to-end.

**Studio extraction stabilization (51 → 0)** — full contract documented at `template-base/frontend/slices/studio/EXTRACTED.md`. Schema additions:
- `tasks` (workflow to-dos): workspaceId, title, description, status, priority, assigneeId, dueDate, createdAt, createdBy, updatedAt, updatedBy + indexes by_workspace, by_workspace_status, by_assignee.
- `cms_collections` (studio CMS canvas persistence).
- `dbTables`, `dbRows` (no-code database, separate `convex/features/database/schema.ts`).
- `documents` (workspace-scoped doc store, separate `convex/features/documents/schema.ts`).
- Notifications unified to support both notion shape (kind/body/read) and studio shape (workspaceId/type/message/isRead/createdBy).
- `CanvasMode` widened to include `'studio'`.
- Testing-library imports split: `screen`/`waitFor` from `@testing-library/dom`, matchers via `@testing-library/jest-dom/vitest`.

### What's still outstanding

#### High value, blocked by user action

- **CLI 0.4.3 publish** — `npm publish --otp=…` from `packages/cli/`. Brings tar override + post-restructure script fixes to registry.
- **Re-trigger Dokploy deploy** — push automatic if webhook configured, else manual via Dokploy UI or `deploy.js`. Build is green.

#### Lower priority, documented for later

- **207 template-base internal tsc errors** — categorized in `template-base/STATUS.md`. Four buckets:
  1. Recharts API drift (~18) — pin `recharts@^2` or rewrite chart wrappers.
  2. Workspace schema extensions (~30) — HierarchySettings + WorkspaceSwitcher reference fields not in kitab schema.
  3. Slice-config aggregator (~15) — re-run config-aggregator script against actual kitab slices.
  4. Misc one-offs (~145) — file-by-file as needed.

  None of these block the deployed kitab, the CLI, or the MCP. Use template-base as a copy-source per-subtree (studio + builder + notion subtrees typecheck clean against the kitab schema).

- **Convex codegen** — `template-base/convex/_generated/*` are hand-written stubs. First `npx convex dev --once` overwrites them with real codegen.

### Files of note

- `template-base/STATUS.md` — granular status of template-base, error buckets, and three options for full clean.
- `template-base/frontend/slices/studio/EXTRACTED.md` — full studio extraction contract + receiving-side wiring notes.
- `docs/studio-extraction.md` — kitab-level pointer to EXTRACTED.md.
- `.github/workflows/ci.yml` — long-term safeguard against the kind of regression that triggered the Docker build failure.

## Earlier sessions

See git log + the source map (`docs/source-map.md`) for the original P1–P10 phase work and the studio extraction (P10) in particular.
