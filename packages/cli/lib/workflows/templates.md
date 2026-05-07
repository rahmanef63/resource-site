# Workflow — Templates (CRUD)

Templates are full-app website templates registered with `category: "website-template"`.
Source of truth: `lib/content/layouts.ts` in the kitab repo.

## Create

1. Build the UI scaffold under `app/preview/<slug>/{public,admin}/` following the
   `personal-brand-os` gold reference (read `template-base/CONSUMER-SETUP.md` first).
2. Build per-template shared at
   `components/templates/<base>/shared/{site-config.ts, types.ts, seed.ts, nav-config.ts, store.tsx}`.
3. Build slice components at `components/templates/<base>/slices/<route>/<RouteName>Page.tsx` for public
   and `components/templates/<base>/slices/admin/<route>/<RouteName>View.tsx` for admin.
4. Reuse chrome from `components/templates/_shared/ui/*` — never create new chrome.
5. Reuse shadcn primitives from `@/components/ui/*` + lucide-react. No new UI lib deps.
6. Register an entry in `lib/content/layouts.ts` with: slug, title, category="website-template",
   description, source, repoPath, primaryFile, tags, previewPath, adminPreviewPath, defaultSurface,
   pullPaths, files (full list), dependencies, exampleCode, agentRecipe.
7. Regenerate manifest: `cd packages/cli && node scripts/gen-manifest.mjs`.
8. Verify: `npx tsc --noEmit` (root + template-base both 0) and `npm run build` (route appears
   in the prerendered list).
9. Commit + push.
10. Publish CLI minor (`packages/cli/package.json` version bump → `npm publish`) so the new
    template lands in the npm tarball consumers fetch via `npx rahman-resources init`.

## Read

- Browse: `https://resource.rahmanef.com/templates` (gallery) or `/layouts/<slug>` (detail).
- CLI: `npx rahman-resources list templates` then `npx rahman-resources info <slug>`.
- MCP tool: `rr_list_templates` / `rr_get`.
- MCP resource: `rr://templates/<slug>`.
- Knowledge base for AI agents: `https://resource.rahmanef.com/llms.txt`.

## Update

1. Edit the entry in `lib/content/layouts.ts` (description, files, agentRecipe — anything).
2. Update the underlying component files if shape changed.
3. Regenerate manifest (same step as Create).
4. Verify build green.
5. Commit + push.
6. Publish CLI patch (content-only) or minor (new field/file in the entry).

## Delete

1. Remove the entry from `lib/content/layouts.ts`.
2. `git rm -r app/preview/<slug>/` and `components/templates/<base>/`.
3. Regenerate manifest.
4. Audit: `grep -r "<slug>"` repo-wide — purge stale references.
5. Commit + push.
6. Publish CLI **major** if the template was widely used (consumers' `init` calls referencing
   the slug will fail), else minor.
