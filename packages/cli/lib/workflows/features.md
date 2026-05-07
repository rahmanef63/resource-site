# Workflow — Features (CRUD)

Features are backend / integration drop-ins (auth, midtrans, resend, vector-search, ai-router, …).
Source of truth: `lib/content/features.ts`.

## Create

1. Build the feature surface — backend code in `convex/features/<slug>/`, frontend code in
   `frontend/slices/<slug>/` (vertical-slice convention per CLAUDE.md).
2. Per-feature schema: `convex/features/<slug>/schema.ts` exporting `<slug>Tables`. Compose into root.
3. Frontend: `frontend/slices/<slug>/{config.ts, init.ts, page.tsx, ...}`. The `config.ts` calls
   `defineFeature({...})` and gets picked up automatically by
   `npx tsx scripts/features/generate-registry.ts`.
4. Register entry in `lib/content/features.ts`: slug, title, description, category, tags,
   pullPaths, files, dependencies, agentRecipe.
5. Regenerate registries:
   ```bash
   npx tsx scripts/features/generate-registry.ts
   npx tsx scripts/features/generate-preview-registry.ts
   npx tsx scripts/features/generate-export-registry.ts
   cd packages/cli && node scripts/gen-manifest.mjs
   ```
6. Verify `npx tsc --noEmit` clean.
7. Commit + push.
8. Publish CLI minor — feature is now installable via `npx rahman-resources add <slug>`.

## Read

- Browse: `https://resource.rahmanef.com/features` then `/features/<slug>`.
- CLI: `npx rahman-resources list features` / `info <slug>`.
- MCP tool: `rr_list_features` / `rr_get`.
- MCP resource: `rr://features/<slug>`.

## Update

1. Edit `lib/content/features.ts` entry.
2. Update slice/convex code if shape changed.
3. Regenerate registries (same as Create step 5).
4. Commit + push.
5. Publish CLI patch (content-only) or minor (file-list change).

## Delete

1. Remove entry from `lib/content/features.ts`.
2. `git rm -r convex/features/<slug>/` + `frontend/slices/<slug>/`.
3. Regenerate registries.
4. Search repo for `<slug>` references — most likely no other feature depends on it,
   but check `site/lib/build/compat.ts` for template×feature compat hints.
5. Commit + push.
6. Publish CLI **major** if widely depended on, else minor.
