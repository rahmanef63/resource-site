# Workflow — Claude Skills (CRUD)

Claude Skills are reusable agent skills (anthropics + rahman-authored) shipped via the kitab.
Source of truth: `site/lib/content/claude-skills.ts` — sync feeds `packages/cli/lib/skills.json`.

## Create

1. Author the skill at `~/.agents/skills/<slug>/SKILL.md` (or the project-local skill path).
   Follow the SKILL.md frontmatter contract (name, description, type, tools).
2. If it should ship via the kitab, add an entry to `site/lib/content/claude-skills.ts`:
   slug, title, description, scope ("anthropics" | "rahman"), tags, sourceUrl.
3. Sync to CLI bundle:
   ```bash
   node packages/cli/scripts/sync-skills.mjs
   ```
   This writes `packages/cli/lib/skills.json` from the TypeScript source. The
   `--check` variant runs in CI to prevent drift.
4. Regenerate manifest: `cd packages/cli && node scripts/gen-manifest.mjs`.
5. Verify the skill shows in `npx rahman-resources list skills`.
6. Commit + push (both `site/lib/content/claude-skills.ts` and `packages/cli/lib/skills.json`).
7. Publish CLI minor — consumers can now `npx rahman-resources add-skill <slug>`.

## Read

- Browse: `https://resource.rahmanef.com/agents` (and on the site Skills are listed alongside
  templates/features in the Bundle Builder at `/build`).
- CLI: `npx rahman-resources list skills` / `info <slug>`.
- MCP tool: `rr_list_skills` / `rr_get`.
- MCP resource: `rr://skills/<slug>`.

## Update

1. Edit `site/lib/content/claude-skills.ts` entry.
2. Edit `~/.agents/skills/<slug>/SKILL.md` if the actual skill changed.
3. Run `node packages/cli/scripts/sync-skills.mjs`.
4. Regenerate manifest.
5. Commit + push.
6. Publish CLI patch (description-only) or minor (slug rename / new tools).

## Delete

1. Remove entry from `site/lib/content/claude-skills.ts`.
2. Delete the SKILL.md folder if no longer used.
3. Re-sync (`sync-skills.mjs`).
4. Regenerate manifest.
5. Commit + push.
6. Publish CLI **major** if widely used (consumers' `add-skill <slug>` will 404),
   else minor.
