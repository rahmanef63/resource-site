# rahman-resources-mcp

Model Context Protocol server for the Rahman Resources kitab. Exposes templates, features, recipes, and Claude Skills to any MCP-aware client (Claude Code, Cursor, Cline).

## Install

Wire into Claude Code (`~/.claude/mcp.json` or project `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "rahman-resources": {
      "command": "npx",
      "args": ["-y", "rahman-resources-mcp"]
    }
  }
}
```

Then in Claude Code: `/mcp` to see the available `rr_*` tools.

## Tools

| Tool | Purpose |
|------|---------|
| `rr_list_templates` | website-template layouts (full-app) |
| `rr_list_features`  | backend / integration features |
| `rr_list_recipes`   | UI patterns to copy manually |
| `rr_list_skills`    | Claude Skills inventory (anthropics + rahman) |
| `rr_search`         | fuzzy search across all kinds |
| `rr_get`            | full entry by slug (any kind) |
| `rr_compose_init_command`  | emit `npx rahman-resources init …` |
| `rr_compose_add_commands`  | emit `add` / `add-skill` script for an existing project |

## Resources

```
rr://manifest                 — full kitab manifest
rr://templates/{slug}         — one template
rr://features/{slug}          — one feature
rr://recipes/{slug}           — one recipe
rr://skills/{slug}            — one Claude skill
```

## Source of truth

Manifest + skills inventory are loaded from the `rahman-resources` runtime dep (`rahman-resources/lib/{manifest,skills}.json`). When working in the monorepo, the loader falls back to the sibling CLI package at `packages/cli/lib/`. Regenerate via:

```bash
cd packages/cli && node scripts/gen-manifest.mjs
```
