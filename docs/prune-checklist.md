# Prune Checklist — Starting a New Project from Kitab

When you copy `template-base/` into a new project:

```bash
cp -r ~/projects/resources/template-base ~/projects/<new-app>
cd ~/projects/<new-app>
git init && git add . && git commit -m "chore: scaffold from kitab"
```

Then prune what you don't need.

## 1. Pick slices from the Grand Tour

> The `cookbook/layouts/*` demos were **retired (2026-06-19)** — `/layouts` is
> decommissioned and the same capabilities now live as composable **slices**.
> Browse them at the live showcase **[/tour](https://resource.rahmanef.com/tour)**
> (every slice is mounted live with its `add` command), then pull what you need:

```bash
npx rahman-resources add landing-sections .   # marketing sections (hero/pricing/faq/blog…)
npx rahman-resources add appshell .           # dashboard / windowed web-OS shell
npx rahman-resources add pages-cms .          # multi-page CMS (Pages CRUD)
```

Each `add` copies files into `slices/<slug>/`, which you own and edit.

## 2. Decide recipes (feature drop-ins)

Pick what applies:
- Block editor? → port from `recipes/`/`frontend/slices/notion/slices/editor/`
- Database views? → `frontend/slices/notion/slices/databases/`
- Command palette? → `recipes/command-palette/` or `frontend/slices/notion/slices/command-palette/`
- Threaded comments? → `recipes/comments-threaded/`
- Contact form + email? → `recipes/contact-form-resend/`
- Theme preset switcher? → `recipes/theme-preset-switcher/`

Delete recipes you don't need.

## 3. Strip notion if not used

Notion is heavy (242 files). If your app doesn't need it:
```bash
rm -rf frontend/slices/notion convex/features/notion
# Edit tsconfig.json: remove @notion/* and @notionConvex/* aliases
```

## 4. Strip business-context shared modules

Some `frontend/shared/` modules are big and only useful for specific apps:
- `builder/` — flow/canvas builder (only if you need n8n-style workflows / studio)
- `communications/` — chat/messaging primitives (only if you need realtime chat)
- `ai/` — AI agent registry (only if you have AI features)

```bash
rm -rf frontend/shared/builder frontend/shared/communications frontend/shared/ai
# Then run audit:bp --full to find leftover imports
```

### Strip studio if not used

Studio is heavy (385 frontend + 13 convex files) and depends on `frontend/shared/builder/` + 8 peer deps. If your app doesn't need UI-builder + workflow-automation:

```bash
rm -rf frontend/slices/studio convex/features/studio app/studio tests/features/studio
# Edit convex/schema.ts: drop ...studioTables, ...studioAgentTables
# package.json: drop reactflow, react-syntax-highlighter, html-to-image, ajv, ajv-formats, react-markdown
#   (keep zustand if other code uses it)
```

If you keep studio, also keep `frontend/shared/builder/` — they ship together.

## 5. Configure project identity

- `package.json` → set `name`, `version`
- `app/layout.tsx` → set `metadata.title.default`, `description`
- `README.md` → write project README
- `CLAUDE.md` → keep hard rules, add project-specific rules
- `next.config.mjs` → adjust `images.remotePatterns` for your assets host
- `.env.example` → fill in production values (NEVER commit `.env.local`)

## 6. Configure auth providers

Edit `convex/auth.ts`:
```ts
providers: [Password, GitHub, Google]
```
Remove unused providers + corresponding env vars in `.env.example`.

## 7. Pick a theme preset

Choose one preset as default. Edit `app/globals.css` to set `:root` to that preset's tokens, OR keep the runtime switcher and just set `[data-theme="<default>"]` on `<html>` in `app/layout.tsx`.

## 8. Generate Convex types

```bash
npx convex dev --once
git add convex/_generated && git commit -m "chore: convex codegen"
```

MANDATORY before deploy.

## 9. First validate run

```bash
pnpm install --yes --legacy-peer-deps
pnpm typecheck       # expect some errors first time, fix progressively
pnpm validate:slice-structure
pnpm audit:bp -- --full
```

Target audit-bp score ≥80 before deploying.

## 10. Deploy

```bash
node $HOME/.agents/skills/si-coder/scripts/deploy.js \
  "$DOKPLOY_API_URL" "$DOKPLOY_API_KEY" \
  "<PROJECT_NAME>" "<APP_NAME>" \
  "$GITHUB_TOKEN" "<DOMAIN>"
```

See `docs/deploy.md` for full pre-flight.
