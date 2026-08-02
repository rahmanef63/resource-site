import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { BRIDGE_CMD, TUNNEL_CMD } from "./constants";

export function SelfHostTab() {
  return (
    <>
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
    </>
  );
}
