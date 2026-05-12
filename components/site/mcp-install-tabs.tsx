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
  --port 8000`;

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
                ships as a stdio Node CLI. ChatGPT Connectors expect HTTP
                (Streamable HTTP / SSE). You run a local bridge + tunnel.
                Endpoint stays open while running — solo/dev use only, or
                add basic-auth at the tunnel layer.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">1. Run the bridge (terminal stays open)</p>
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
            <p className="text-sm font-medium">3. Add to ChatGPT</p>
            <p className="text-xs text-muted-foreground">
              Requires <span className="font-medium text-foreground">ChatGPT Pro / Team / Enterprise</span>{" "}
              (Connectors feature).
            </p>
            <ol className="ml-4 list-decimal space-y-1 text-xs text-muted-foreground">
              <li>Settings → Connectors → <span className="font-medium">New custom connector</span></li>
              <li>URL: <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">https://&lt;tunnel-url&gt;/sse</code></li>
              <li>Authentication: <span className="font-medium text-foreground">None</span></li>
              <li>Click <span className="font-medium">Test</span> → 8 tools list</li>
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
              <li>Tunnel must stay up — close terminal = connector disconnects</li>
              <li>No auth = anyone with the URL can call your tools (read-only manifest only, but still echo)</li>
              <li>For production: deploy the bridge on a server with proper auth in front of <code className="rounded bg-muted px-0.5 font-mono">/sse</code></li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
