# Workflow — Recipes (CRUD)

Recipes are UI patterns to **copy manually** (block-editor, command-palette, asymmetric-masonry, …).
Lower-friction than features — recipes don't always have backend pieces.
Source of truth: `lib/content/recipes.ts`.

## Create

1. Build the UI under any of these (pick what fits the recipe shape):
   - `frontend/slices/<slug>/` for full slice patterns
   - `components/<area>/<Component>.tsx` for single-component recipes
   - Existing `cookbook/` or `recipes/` dirs at repo root for ready-to-paste snippets
2. Register entry in `lib/content/recipes.ts`: slug, title, description, source, repoPath, tags,
   exampleCode (the snippet user pastes), agentRecipe (instructions for AI to install).
3. Regenerate manifest: `cd packages/cli && node scripts/gen-manifest.mjs`.
4. Verify build (recipes show on `/recipes` index + `/recipes/<slug>` detail).
5. Commit + push.
6. Publish CLI patch — recipes don't ship as installable artifacts via `add`; they're
   reference patterns reachable via the docs site + MCP.

## Read

- Browse: `https://resource.rahmanef.com/recipes` then `/recipes/<slug>`.
- CLI: `npx rahman-resources list` (no recipe-only filter; full mixed list) / `info <slug>`.
- MCP tool: `rr_list_recipes` / `rr_get`.
- MCP resource: `rr://recipes/<slug>`.

## Update

1. Edit `lib/content/recipes.ts` entry.
2. Update the underlying snippet/file if it lives in the repo.
3. Regenerate manifest.
4. Commit + push.
5. Publish CLI patch.

## Delete

1. Remove entry from `lib/content/recipes.ts`.
2. Remove the underlying file(s) if exclusive to this recipe.
3. Regenerate manifest.
4. Commit + push.
5. Publish CLI patch (recipes don't have installer call-sites — safe to remove).
