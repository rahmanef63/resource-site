"use client";

import * as React from "react";
import { Terminal, Code2, Bot, AlertTriangle } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">stdio server + no auth — bridge needed</p>
              <p className="text-muted-foreground">
                <code className="rounded bg-muted px-1 font-mono text-[10px]">rahman-resources-mcp</code>{" "}
                ships as a stdio Node CLI. ChatGPT Apps SDK expects{" "}
                <span className="font-medium text-foreground">Streamable HTTP at <code className="font-mono">/mcp</code></span>.
                Run a local stdio→HTTP bridge + public tunnel.
                Auth is <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" target="_blank" rel="noreferrer" className="underline">OPTIONAL per MCP spec</a> —
                this server doesn&apos;t enforce any. Endpoint stays open while
                tunneled — solo/dev use only.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">1. Run the bridge (stdio → Streamable HTTP)</p>
            <CodeBlock code={BRIDGE_CMD} language="bash" filename="terminal A" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">2. Expose via tunnel</p>
            <CodeBlock code={TUNNEL_CMD} language="bash" filename="terminal B" />
            <p className="text-xs text-muted-foreground">
              Copy the public URL (e.g.{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">https://abc.trycloudflare.com</code>).
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">3. Enable ChatGPT Developer Mode</p>
            <p className="text-xs text-muted-foreground">
              Settings → <span className="font-medium text-foreground">Apps &amp; Connectors</span>{" "}
              → <span className="font-medium text-foreground">Advanced settings</span>{" "}
              → toggle{" "}
              <span className="font-medium text-foreground">Developer mode</span>.
              Custom connectors live on <span className="font-medium text-foreground">all plans</span>{" "}
              since 2025-11-13 (Free / Plus / Pro / Business / Enterprise / Edu).
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">4. Create the connector</p>
            <ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
              <li>Settings → Connectors → <span className="font-medium">Create</span></li>
              <li>Name: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">rahman-resources</code></li>
              <li>Connector URL: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">https://&lt;tunnel-url&gt;/mcp</code></li>
              <li>Authentication: <span className="font-medium text-foreground">None</span></li>
              <li>Save — advertised tools list appears (8 read-only tools)</li>
              <li>New chat → <span className="font-mono text-foreground">+</span> → More → pick connector → prompt the model</li>
            </ol>
            <p className="pt-1 text-xs text-muted-foreground">
              Try:{" "}
              <em>&ldquo;What kitab templates ship public + admin combos?&rdquo;</em>{" "}
              — ChatGPT calls{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">rr_list_templates</code>{" "}
              via the bridge.
            </p>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <p className="font-medium">Limitations</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
              <li>Tunnel + bridge terminal must stay up — close = connector disconnects</li>
              <li>No auth = anyone with the URL can call your tools (read-only manifest, but exposed)</li>
              <li>For prod: deploy the bridge with a real OAuth flow + protected <code className="rounded bg-muted px-0.5 font-mono">/mcp</code>. MCP spec allows{" "}
                <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-registration-approaches" target="_blank" rel="noreferrer" className="underline">3 client-registration approaches</a>{" "}
                (Client ID Metadata Docs / Pre-registration / Dynamic Client Reg).
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Refs:{" "}
            <a href="https://developers.openai.com/apps-sdk/deploy/connect-chatgpt" target="_blank" rel="noreferrer" className="underline">Apps SDK — Connect from ChatGPT</a>{" "}
            ·{" "}
            <a href="https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization" target="_blank" rel="noreferrer" className="underline">MCP authorization spec</a>
          </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}
