# rahman-resources-mcp

Model Context Protocol server for the Rahman Resources kitab. Exposes templates, slices, features, recipes, Claude Skills, and public infrastructure/provider setup guidance to any MCP-aware client.

Two transports:
- **stdio** (default) — Claude Code, Cursor, Cline
- **Streamable HTTP** (`--http`, v0.9.0+) — ChatGPT Apps SDK, browser clients

## Install — stdio (Claude Code / Cursor / Cline)

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

## Install — HTTP (ChatGPT, hosted)

Public read-only endpoint (no auth — manifest is public, same data shown on the docs site):

```
https://mcp-resource.rahmanef.com/mcp
```

ChatGPT: Settings → Apps & Connectors → Advanced settings → enable **Developer mode** → Connectors → **Create** → paste URL → Auth: None.

## Install — HTTP (self-host)

```bash
# native HTTP mode (v0.9.0+)
npx -y rahman-resources-mcp --http --port 8000
# endpoint: http://localhost:8000/mcp

# optional bearer auth
MCP_BEARER_TOKEN=secret npx -y rahman-resources-mcp --http
```

Or build the published `packages/mcp/Dockerfile` — stateless Streamable HTTP at `/mcp`, health probe at `/health`.

## Tools

| Tool | Purpose |
|------|---------|
| `rr_list_templates` | website-template layouts (full-app) |
| `rr_list_features`  | backend / integration features |
| `rr_list_recipes`   | UI patterns to copy manually |
| `rr_list_skills`    | Claude Skills inventory (anthropics + rahman) |
| `rr_list_infrastructure` | provider field/setup guidance; filter by provider |
| `rr_get_infrastructure` | exact provider resource definition by id |
| `rr_search`         | fuzzy search across all kinds |
| `rr_get`            | full entry by slug (any kind) |
| `rr_compose_init_command`  | emit `npx rahman-resources init …` |
| `rr_compose_add_commands`  | emit `add` / `add-skill` script for an existing project |

## Resources

```
rr://manifest                 — full kitab manifest
rr://infrastructure           — full public infrastructure guidance catalog
rr://infrastructure/{id}      — one exact provider field/resource definition
rr://templates/{slug}         — one template
rr://features/{slug}          — one feature
rr://recipes/{slug}           — one recipe
rr://skills/{slug}            — one Claude skill
```

## Source of truth and runtime bundle

`packages/cli/lib` remains the single definition authority for the manifest, skills, infrastructure guidance, workflows, and DNA helpers. Local monorepo development reads that sibling CLI source directly. Published/container MCP builds read `runtime/rahman-resources/`, a generated snapshot with per-file and aggregate SHA-256 metadata.

Regenerate and verify the snapshot with:

```bash
node packages/cli/scripts/gen-manifest.mjs
node packages/mcp/scripts/sync-runtime.mjs
node packages/mcp/scripts/sync-runtime.mjs --check
```

The MCP package therefore has no runtime npm dependency on `rahman-resources`; `prepublishOnly` rejects a stale generated bundle.
