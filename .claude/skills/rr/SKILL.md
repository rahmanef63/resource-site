---
name: rr
description: CRUD slices and templates in the Rahman Resources kitab — create new slices/templates, modify existing ones, port features from superspace/external sources, validate, and prep for publish. Wires the local scaffolders, the npx CLI, and the MCP server.
---

# /rr — Rahman Resources author skill

You are the kitab author's pair-programmer. The user typed `/rr` because they want to add or change a slice or template. Drive the full workflow: scaffold → port code → validate → register → publish-ready.

## Hard rules (from `CLAUDE.md`)

1. NO Clerk. Auth = `@convex-dev/auth`.
2. All UI = shadcn primitives or composed from shadcn.
3. Copy-first flow — `cp -r` from a source, never greenfield.
4. Stack: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.
5. Slice imports MUST resolve via `@/components/ui/*`, `@/components/shared/*`, `@/lib/shared/*`, `@/lib/utils`, `@/shared/*`, `@convex/*`, common npm libs, or relative-within-slice. Anything else fails `audit:slices`.

## Decide what the user wants — five entry points

| User intent | Action |
|---|---|
| "buat slice baru" / "create new slice" | `Create slice` flow below |
| "modify slice X" / "tambah env / npm / peer ke X" | `Modify slice` flow |
| "port from superspace" / "ambil feature dari superspace" | `Port slice` flow |
| "buat template baru" / "clone template" | `Create template` flow |
| "siap publish" / "ready to publish" | `Publish prep` flow |

If the user is vague, ask one targeted question. Don't survey — pick the most likely intent from context (the file they're looking at, the recent git diff, the slice they just touched).

## Flow A — Create slice (greenfield)

1. Confirm: `slug` (kebab-case), `category` (one of: ai, auth, data, payment, email, realtime, storage, search, content, ui, infra), `title`, `description`. If user gave only a slug, ask for category in one short prompt.
2. Run:
   ```bash
   npm run new:slice -- --slug <slug> --category <cat> --title "<title>" --description "<desc>"
   ```
   This copies templates, rewrites identifiers, appends a stub row to `lib/content/slices.ts`, and runs `npm run slices:check`.
3. Open the new files in this order: `frontend/slices/<slug>/slice.json` → `frontend/slices/<slug>/page.tsx` → `convex/features/<slug>/schema.ts`.
4. Replace stub UI + backend with the user's actual feature. Imports must follow §5 of `docs/lifting-features.md`.
5. Fill rich metadata in `lib/content/slices.ts` (`docsUrl`, `install`, `exampleCode`, `agentRecipe`, `usedBy`).
6. Run validation chain:
   ```bash
   npm run slices:check && npx tsc --noEmit
   ```
7. Sync CLI manifest:
   ```bash
   npm run manifest:sync
   ```
8. Stage, commit, push.

## Flow B — Modify existing slice

Use `npm run modify:slice` — it edits `slice.json` AND `lib/content/slices.ts` together.

```bash
# Add an npm package
npm run modify:slice -- --slug <slug> --add-npm "pkg@^1"

# Add shadcn component(s) — comma-sep
npm run modify:slice -- --slug <slug> --add-shadcn dialog,toast

# Add an env var (NAME:scope[:required], scope=convex|next-public|server)
npm run modify:slice -- --slug <slug> --add-env STRIPE_KEY:server:required

# Add a peer slice
npm run modify:slice -- --slug <slug> --add-peer convex-auth@^0.1

# Add a provider name (sub-folder pattern)
npm run modify:slice -- --slug <slug> --add-provider doku

# Bump version
npm run modify:slice -- --slug <slug> --bump minor

# Set fields
npm run modify:slice -- --slug <slug> --set-description "..." --set-docs https://... --set-install "npm i ..."
```

Combine flags freely — they all run in one pass and the script runs `slices:check` at the end. After modifying, sync the manifest if any catalog field changed: `npm run manifest:sync`.

## Flow C — Port from superspace (or any external source)

Read `docs/lifting-features.md` once for the full mapping. Concrete sequence:

1. Identify the source — `superspace/frontend/slices/<name>/` + `superspace/convex/features/<name>/`.
2. Scaffold an empty slice in the kitab with the same or different slug:
   ```bash
   npm run new:slice -- --slug <slug> --category <cat>
   ```
3. Copy source files into the new slice dirs:
   ```bash
   cp -r ~/projects/superspace/frontend/slices/<name>/* frontend/slices/<slug>/
   cp -r ~/projects/superspace/convex/features/<name>/* convex/features/<slug>/
   ```
   (Don't overwrite the just-scaffolded `slice.json` blindly — diff first; the scaffolded one already has the right slug + category.)
4. Rewrite imports — superspace uses paths the kitab disallows. Common rewrites (full table in `docs/lifting-features.md` §5):

   | superspace import | kitab equivalent |
   |---|---|
   | `@/frontend/slices/other/...` | declare other as a peer; never deep-import |
   | `@/frontend/shared/ui/<x>` | move `<x>` to `components/templates/_shared/ui/<x>.tsx`, import as `@/components/shared/ui/<x>` |
   | `../../shared/lib/<x>` | move to `lib/shared/<topic>/<x>.ts`, import as `@/lib/shared/<topic>/<x>` |

5. If the source uses shared UI not yet in the kitab, lift it first to `components/templates/_shared/ui/` (cross-template) or `components/shared/` (cross-slice). Never let a slice deep-import another slice.
6. Patch the convex schema — wrap exports as `<camelSlug>Tables = { ... }`. Prefix table names with the slug if there's any risk of collision.
7. Replace `.collect()` with `.withIndex(...).take(N)`. Add `args: { ... }` validators on every public Convex function. Verify webhook signatures with constant-time compare.
8. Validate:
   ```bash
   npm run slices:check && npx tsc --noEmit
   ```
9. Update `lib/content/slices.ts` row with all the rich fields.
10. `npm run manifest:sync && git commit`.

## Flow D — Create template (clone existing)

```bash
npm run new:template -- --slug <new-slug> --from <existing-slug>
```

Templates are big — this clones the whole `app/preview/<slug>/` tree + the matching `components/templates/<base>/` shared dir, rewrites path constants, and appends a stub `LayoutEntry` to `lib/content/layouts.ts`.

After cloning:
1. Walk the new `app/preview/<slug>/` and replace business copy.
2. Edit `components/templates/<new-base>/shared/site-config.ts` for brand, colors, nav.
3. Edit the new `LayoutEntry` in `lib/content/layouts.ts` — set the real description, source attribution, tags. **Verify `pullPaths`** — the script's stub may not enumerate every file the consumer's `npx rr add <slug>` needs.
4. `npm run manifest:sync && npm run build` to make sure all routes prerender.

## Flow E — Publish prep

After any change to `packages/cli/` or `packages/mcp/` (or after touching `lib/content/{slices,layouts,recipes,claude-skills}.ts` then running `manifest:sync`):

1. Ensure clean validators: `npm run slices:check && npx tsc --noEmit && npm run build`.
2. Bump versions if package contents changed:
   ```bash
   cd packages/cli && npm version patch     # or minor/major
   cd packages/mcp && npm version patch
   ```
3. Commit + push to `main`.
4. Tell the user the OTP-required commands (don't run them — user runs them):
   ```
   cd packages/cli && npm publish --otp=…
   cd packages/mcp && npm publish --otp=…
   ```
5. After publish lands, mention "redeploy Dokploy site to surface the new slice in the catalog."

## Verification — what to run before saying "done"

Always close with this checklist (skip steps that obviously don't apply):

- [ ] `npm run slices:check` — slug/imports/schema/registry-drift
- [ ] `npx tsc --noEmit` — types
- [ ] `npm run manifest:sync` — only if `lib/content/*.ts` changed
- [ ] `npm run build` — only for template work or schema changes that affect prerender

If any fail, fix the root cause — don't bypass with `--no-verify` or skip validators.

## Reference docs (read these once when context allows)

- `docs/lifting-features.md` — complete porting checklist + import boundary table
- `docs/authoring-slices.md` — slice contract + provider sub-folder pattern
- `docs/slice-architecture.md` — full architecture rationale
- `docs/source-map.md` + `CLAUDE.md` source map — where to lift from
- `packages/cli/lib/slice-schema.json` — slice.json contract enforced by `validate-slices`

## Output style

- Bahasa Indonesia or English depending on user's language. Match the user.
- Caveman compatible — short sentences, fragments OK. Include exact commands.
- Tell the user what file you'll touch next BEFORE editing.
- After edits, summarize changes in 2-3 lines.
- End every successful flow with the publish-prep checklist (Flow E) so user knows the deploy pipeline.
