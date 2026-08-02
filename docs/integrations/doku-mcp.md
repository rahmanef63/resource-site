# DOKU MCP Integration — Track B

Optional layer on top of the `doku-payment` slice. Lets an MCP-aware client
(Claude Code, Claude Desktop, VSCode MCP, n8n, custom agent) **invoke
DOKU directly** as tools — without going through our Convex actions.

> Track A (the slice) is enough for most projects. Use Track B when your
> template ships an AI assistant that should be able to create payments
> on its own (e.g. `kreator-studio-os` with `ai-router`, or a support
> chat that says "OK, here's your payment link").

## When to use

| Scenario | Track A (slice) | Track B (MCP) |
|---|---|---|
| User clicks "Pay" in your UI | ✅ | n/a |
| Cron job creates monthly invoice | ✅ | n/a |
| Chatbot generates payment link mid-conversation | ✅ (via tool-call to Convex action) | ✅ (direct from agent) |
| Claude Code drives an end-to-end demo | n/a | ✅ |
| You want the agent to read payment status / refund | ✅ | ✅ |

Both tracks use the same DOKU credentials and merchant account — Track B
is **additive**, not a replacement.

## Prerequisites

1. DOKU MCP credentials: contact DOKU sales, request **"Payment
   Integration via MCP Server (AI Agents)"**. You'll get an API key +
   Client-Id (same shape as the REST credentials).
2. Base64-encode the API key for the `Authorization` header:
   ```bash
   printf '%s:' "$DOKU_MCP_API_KEY" | base64
   ```

## Claude Code config

Drop this into `.claude/mcp.json` at your project root (or the global
`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "doku": {
      "type": "http",
      "url": "https://mcp.doku.com",
      "headers": {
        "Client-Id": "${DOKU_MCP_CLIENT_ID}",
        "Authorization": "Basic ${DOKU_MCP_API_KEY_B64}"
      }
    }
  }
}
```

Then run `claude` — `Tools` panel shows `checkout_payment`,
`direct_payment`, `get_payment_status` (names per DOKU's published
schema; verify after first connection).

Export the env vars at session start:

```bash
export DOKU_MCP_CLIENT_ID="MCH-…"
export DOKU_MCP_API_KEY_B64="$(printf '%s:' "$DOKU_MCP_API_KEY" | base64)"
```

## Auto-setup helper

Run from the project root:

```bash
node scripts/setup-doku-mcp.mjs
```

Reads `DOKU_MCP_CLIENT_ID` + `DOKU_MCP_API_KEY` from `.env.local`, base64-encodes
the key, and writes the snippet into `.claude/mcp.json` (preserves
existing servers).

## Server-side proxy (advanced)

If your backend needs to invoke DOKU MCP (e.g. server-rendered AI
response that creates a payment), wrap it as a Convex action. We don't
ship this by default — it duplicates the REST API surface for negligible
benefit — but the pattern is:

```ts
// convex/features/payment/actions/doku-mcp-proxy.ts
"use node";
import { action } from "../../../_generated/server";
import { v } from "convex/values";

export const callDokuMcp = action({
  args: { tool: v.string(), input: v.any() },
  handler: async (_ctx, { tool, input }) => {
    const auth = "Basic " + Buffer.from(process.env.DOKU_MCP_API_KEY + ":").toString("base64");
    const res = await fetch(`${process.env.DOKU_MCP_URL}/tools/${tool}`, {
      method: "POST",
      headers: {
        "Client-Id": process.env.DOKU_MCP_CLIENT_ID!,
        "Authorization": auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return await res.json();
  },
});
```

Use this only if you can't reach Track A from the chatbot pipeline.

## Security

- MCP credentials are **server-only** — never expose to the browser or
  embed in shipped JS.
- Treat the `.claude/mcp.json` like `.env` — gitignore it or use env-var
  substitution as in the example above.
- Rate-limit agent-driven payments at the application layer; an agent
  in a loop could spam orders.

## Trouble-shooting

| Symptom | Likely cause |
|---|---|
| MCP server lists 0 tools | Wrong Client-Id, expired key, or base64 missing trailing `:` |
| 401 Unauthorized | Authorization header missing `Basic ` prefix |
| Tools succeed but webhooks don't fire | Notification URL not set in dashboard, or signature secret mismatch |

## Sources

- DOKU MCP Server overview — `docs.doku.com/integration/mcp-server`
- DOKU contact-sales (request MCP creds) — `doku.com/contact`
- MCP spec — `modelcontextprotocol.io`
