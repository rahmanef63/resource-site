# resource.rahmanef.com — public site

Public showcase for the [resources/](https://github.com/rahmanef63/resources) kitab.

- shadcn-style sidebar layout
- Per-layout & per-recipe pages with Preview / Code / Install tabs
- `/llms.txt` + `/api/knowledge` for AI agents
- "Install with Agent" prompt builder (copy → paste into Claude Code / Cursor)

## Stack

Next.js 16 + React 19 + Tailwind 4 + shadcn/ui. No backend.

## Dev

```bash
cd site
npm install --yes --legacy-peer-deps
npm run dev
```

Open http://localhost:3000.

## Deploy

```bash
cd site
node $HOME/.agents/skills/si-coder/scripts/deploy.js \
  "$DOKPLOY_API_URL" "$DOKPLOY_API_KEY" \
  "rahmanef-resources" "resource-site" \
  "$GITHUB_TOKEN" "resource.rahmanef.com"
```

Single-service Compose (no Convex). Hostinger DNS auto-wired if `HOSTINGER_API_TOKEN` set.
