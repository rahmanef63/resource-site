"use client";

import * as React from "react";
import { Terminal, Code2, Bot, AlertTriangle, Cloud, Wrench } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HOSTED_URL = "https://mcp-resource.rahmanef.com/mcp";

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

            {/* HOSTED — OAuth 2.1 + PKCE */}
            <TabsContent value="hosted" className="space-y-4 pt-4">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
                <p className="font-medium text-foreground">Public hosted MCP — OAuth 2.1 + PKCE</p>
                <p className="mt-1 text-muted-foreground">
                  ChatGPT custom-app form only offers OAuth — even for public
                  read-only data. The flow is ceremonial: paste the URLs, click
                  Authorize once, ChatGPT gets a token. No account needed; data
                  is the same kitab manifest shown on this site.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">1. Enable ChatGPT Developer Mode</p>
                <p className="text-xs text-muted-foreground">
                  Settings → <span className="font-medium text-foreground">Apps &amp; Connectors</span>{" "}
                  → <span className="font-medium text-foreground">Advanced settings</span>{" "}
                  → toggle{" "}
                  <span className="font-medium text-foreground">Developer mode</span>.
                  Custom connectors on all plans since 2025-11-13.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">2. Create the connector — paste these fields verbatim</p>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider">ChatGPT field</th>
                        <th className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t"><td className="px-2 py-1.5">MCP Server URL</td><td className="px-2 py-1.5 font-mono"><code>https://mcp-resource.rahmanef.com/mcp</code></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Authentication</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">OAuth</span></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Registration method</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">User-Defined OAuth Client</span></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Client ID</td><td className="px-2 py-1.5 font-mono"><code>chatgpt-rahman</code> (any string)</td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Client Secret</td><td className="px-2 py-1.5"><em>empty</em></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Token endpoint auth method</td><td className="px-2 py-1.5 font-mono"><code>none</code></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Auth URL</td><td className="px-2 py-1.5 font-mono"><code>https://mcp-resource.rahmanef.com/oauth/authorize</code></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Token URL</td><td className="px-2 py-1.5 font-mono"><code>https://mcp-resource.rahmanef.com/api/oauth/token</code></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Authorization server base</td><td className="px-2 py-1.5 font-mono"><code>https://mcp-resource.rahmanef.com</code></td></tr>
                      <tr className="border-t"><td className="px-2 py-1.5">Resource</td><td className="px-2 py-1.5 font-mono"><code>https://mcp-resource.rahmanef.com/mcp</code></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">3. Authorize</p>
                <p className="text-xs text-muted-foreground">
                  Save → ChatGPT opens the consent page → click{" "}
                  <span className="font-medium text-foreground">Authorize</span>{" "}
                  → token issued (1-year TTL) → 14 tools list. New chat →{" "}
                  <span className="font-mono text-foreground">+</span> → More → pick connector → ask
                  things like{" "}
                  <em>&ldquo;Which kitab templates ship a public + admin combo?&rdquo;</em>
                </p>
              </div>

              <div className="rounded-md border bg-muted/30 p-3 text-xs">
                <p className="font-medium">Tech detail</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                  <li>PKCE S256 required (RFC 7636); auth codes single-use, 5-min TTL</li>
                  <li>Access tokens = HMAC-signed opaque strings, stateless; revocation by rotating server signing key</li>
                  <li>Discovery at <code className="font-mono">/.well-known/oauth-authorization-server</code> (RFC 8414) + <code className="font-mono">/.well-known/oauth-protected-resource</code> (RFC 9728)</li>
                  <li>Anonymous consent — no user account; the kitab is public read-only</li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                Refs:{" "}
                <a href="https://developers.openai.com/apps-sdk/deploy/connect-chatgpt" target="_blank" rel="noreferrer" className="underline">Apps SDK — Connect from ChatGPT</a>{" "}
                ·{" "}
                <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-registration-approaches" target="_blank" rel="noreferrer" className="underline">MCP authorization (User-Defined Client)</a>{" "}
                ·{" "}
                <a href="https://datatracker.ietf.org/doc/html/rfc7636" target="_blank" rel="noreferrer" className="underline">RFC 7636 PKCE</a>
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
