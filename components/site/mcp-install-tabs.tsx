"use client";

import * as React from "react";
import { Terminal, Code2, Bot, AlertTriangle, Cloud, Wrench } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HOSTED_URL =
  process.env.NEXT_PUBLIC_MCP_SERVER_URL ?? "https://mcp-resource.rahmanef.com/mcp";
const HOSTED_BASE = HOSTED_URL.replace(/\/mcp\/?$/, "");

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "rahman-resources": {
      "command": "npx",
      "args": ["-y", "rahman-resources-mcp"]
    }
  }
}`;

const CURSOR_CONFIG = `// Cursor: Settings → MCP → New MCP Server
{
  "name": "rahman-resources",
  "command": "npx",
  "args": ["-y", "rahman-resources-mcp"],
  "transport": "stdio"
}`;

const BRIDGE_CMD = `npx -y supergateway \\
  --stdio "npx -y rahman-resources-mcp" \\
  --outputTransport streamableHttp \\
  --port 8000
# endpoint: http://localhost:8000/mcp`;

const TUNNEL_CMD = `# pick one — terminal stays open while connector is in use
npx -y cloudflared tunnel --url http://localhost:8000
# or
ngrok http 8000`;

export function McpInstallTabs() {
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Install</h2>
      <p className="text-muted-foreground">
        Pick your client. Claude Code / Cursor / Cline use the same stdio
        command. ChatGPT needs a bridge — see notes.
      </p>

      <Tabs defaultValue="claude" className="w-full">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="claude" className="gap-1.5">
            <Terminal className="size-3.5" /> Claude Code
          </TabsTrigger>
          <TabsTrigger value="cursor" className="gap-1.5">
            <Code2 className="size-3.5" /> Cursor / Cline
          </TabsTrigger>
          <TabsTrigger value="chatgpt" className="gap-1.5">
            <Bot className="size-3.5" /> ChatGPT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="claude" className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Add to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">~/.claude/mcp.json</code>{" "}
            (global) or <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.claude/mcp.json</code>{" "}
            (per-project):
          </p>
          <CodeBlock code={CLAUDE_CONFIG} language="json" filename="mcp.json" />
          <p className="text-xs text-muted-foreground">
            Then <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">/mcp</code>{" "}
            inside Claude Code — see <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">rahman-resources</code>{" "}
            with 8 tools.
          </p>
        </TabsContent>

        <TabsContent value="cursor" className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Same stdio command — wire via the editor&apos;s MCP UI.
          </p>
          <CodeBlock code={CURSOR_CONFIG} language="json" filename="cursor mcp settings" />
        </TabsContent>

        <TabsContent value="chatgpt" className="space-y-4 pt-4">
          <Tabs defaultValue="hosted" className="w-full">
            <TabsList className="h-auto">
              <TabsTrigger value="hosted" className="gap-1.5">
                <Cloud className="size-3.5" /> Hosted (recommended)
              </TabsTrigger>
              <TabsTrigger value="self" className="gap-1.5">
                <Wrench className="size-3.5" /> Self-host / local dev
              </TabsTrigger>
            </TabsList>

            {/* HOSTED — open by default, OAuth as ChatGPT-form ceremony */}
            <TabsContent value="hosted" className="space-y-4 pt-4">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                <p className="font-medium text-foreground">Open public endpoint — no auth</p>
                <p className="mt-1 text-muted-foreground">
                  <code className="rounded bg-muted px-1 font-mono text-[10px]">{HOSTED_URL}</code>{" "}
                  serves the Rahman Resources manifest via Streamable HTTP. Same public data as this site.
                  Paste &amp; go — Claude Code / Cursor / Cline / curl / SDK clients all work directly.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Smoke test (any HTTP client)</p>
                <CodeBlock
                  code={`curl -X POST ${HOSTED_URL} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
                  language="bash"
                  filename="terminal"
                />
                <p className="text-xs text-muted-foreground">
                  Returns SSE-streamed JSON with 14 read-only <code className="font-mono">rr_*</code> tools.
                </p>
              </div>

              <details className="rounded-md border bg-muted/20">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
                  ChatGPT custom-app — OAuth fields (only if Developer-Mode form rejects no-auth)
                </summary>
                <div className="space-y-3 border-t border-border/60 p-3 text-xs">
                  <p className="text-muted-foreground">
                    The server ALSO serves OAuth 2.1 + PKCE endpoints so ChatGPT&apos;s
                    Developer-Mode connector form has somewhere to point. The
                    flow is ceremonial — <em>tokens issued by /oauth/* are NOT
                    validated on /mcp</em> because Rahman Resources is public read-only.
                    Try connecting with <span className="font-medium text-foreground">Authentication: None</span>{" "}
                    first; only fall back to this if the form mandates OAuth.
                  </p>
                  <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
                    <li>ChatGPT Settings → <span className="font-medium text-foreground">Apps &amp; Connectors</span> → Advanced settings → enable Developer Mode</li>
                    <li>Connectors → <span className="font-medium text-foreground">Create</span> → paste fields verbatim:</li>
                  </ol>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-left">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider">ChatGPT field</th>
                          <th className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider">Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-t"><td className="px-2 py-1.5">MCP Server URL</td><td className="px-2 py-1.5 font-mono"><code>{HOSTED_URL}</code></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Authentication</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">OAuth</span></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Registration method</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">User-Defined OAuth Client</span></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Client ID</td><td className="px-2 py-1.5 font-mono"><code>chatgpt-rahman</code> (any string)</td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Client Secret</td><td className="px-2 py-1.5"><em>empty</em></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Token endpoint auth method</td><td className="px-2 py-1.5 font-mono"><code>none</code></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Auth URL</td><td className="px-2 py-1.5 font-mono"><code>{HOSTED_BASE}/oauth/authorize</code></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Token URL</td><td className="px-2 py-1.5 font-mono"><code>{HOSTED_BASE}/api/oauth/token</code></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Authorization server base</td><td className="px-2 py-1.5 font-mono"><code>{HOSTED_BASE}</code></td></tr>
                        <tr className="border-t"><td className="px-2 py-1.5">Resource</td><td className="px-2 py-1.5 font-mono"><code>{HOSTED_URL}</code></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-muted-foreground">
                    Save → consent page → <span className="font-medium text-foreground">Authorize</span>{" "}
                    → ChatGPT gets a token → 14 tools list. Discovery at{" "}
                    <code className="font-mono">/.well-known/oauth-{`{`}authorization-server,protected-resource{`}`}</code>.
                  </p>
                </div>
              </details>

              <p className="text-xs text-muted-foreground">
                Refs:{" "}
                <a href="https://developers.openai.com/apps-sdk/deploy/connect-chatgpt" target="_blank" rel="noreferrer" className="underline">Apps SDK — Connect from ChatGPT</a>{" "}
                ·{" "}
                <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" target="_blank" rel="noreferrer" className="underline">MCP authorization (OPTIONAL)</a>
              </p>
            </TabsContent>

            {/* SELF-HOST */}
            <TabsContent value="self" className="space-y-4 pt-4">
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Run your own HTTP MCP endpoint</p>
                  <p className="text-muted-foreground">
                    Two options: (a) run{" "}
                    <code className="rounded bg-muted px-1 font-mono text-[10px]">rahman-resources-mcp --http</code>{" "}
                    directly, or (b) bridge stdio via supergateway. Both produce
                    Streamable HTTP at <code className="font-mono">/mcp</code>.
                    Expose via cloudflared / ngrok for ChatGPT.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Option A — native HTTP mode (v0.9.0+)</p>
                <CodeBlock
                  code={`npx -y rahman-resources-mcp --http --port 8000
# endpoint: http://localhost:8000/mcp
# optional auth: MCP_BEARER_TOKEN=<secret> npx -y rahman-resources-mcp --http`}
                  language="bash"
                  filename="terminal A"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Option B — stdio → HTTP bridge</p>
                <CodeBlock code={BRIDGE_CMD} language="bash" filename="terminal A" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Tunnel to public URL</p>
                <CodeBlock code={TUNNEL_CMD} language="bash" filename="terminal B" />
                <p className="text-xs text-muted-foreground">
                  Copy the public URL (e.g.{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">https://abc.trycloudflare.com</code>).
                  Then enable Developer Mode + create connector pointing at{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">https://&lt;tunnel&gt;/mcp</code>.
                </p>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <p className="font-medium">Limitations</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                  <li>Bridge + tunnel terminals must stay up</li>
                  <li>Without <code className="rounded bg-muted px-0.5 font-mono">MCP_BEARER_TOKEN</code>, endpoint is open — read-only manifest, but exposed</li>
                  <li>For prod auth: MCP spec allows{" "}
                    <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-registration-approaches" target="_blank" rel="noreferrer" className="underline">3 client-registration approaches</a>{" "}
                    (Client ID Metadata Docs / Pre-registration / Dynamic Client Reg). Bearer is a quick interim.
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </section>
  );
}
