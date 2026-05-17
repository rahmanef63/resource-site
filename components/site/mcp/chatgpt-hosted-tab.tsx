import * as React from "react";
import { CodeBlock } from "@/components/site/code-block";

export function ChatGptHostedTab({
  hostedUrl,
  hostedBase,
}: {
  hostedUrl: string;
  hostedBase: string;
}) {
  return (
    <>
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
        <p className="font-medium text-foreground">Open public endpoint — no auth</p>
        <p className="mt-1 text-muted-foreground">
          <code className="rounded bg-muted px-1 font-mono text-[10px]">{hostedUrl}</code>{" "}
          serves the Rahman Resources manifest via Streamable HTTP. Same public data as this site.
          Paste &amp; go — Claude Code / Cursor / Cline / curl / SDK clients all work directly.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Smoke test (any HTTP client)</p>
        <CodeBlock
          code={`curl -X POST ${hostedUrl} \\
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
                <tr className="border-t"><td className="px-2 py-1.5">MCP Server URL</td><td className="px-2 py-1.5 font-mono"><code>{hostedUrl}</code></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Authentication</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">OAuth</span></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Registration method</td><td className="px-2 py-1.5"><span className="font-medium text-foreground">User-Defined OAuth Client</span></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Client ID</td><td className="px-2 py-1.5 font-mono"><code>chatgpt-rahman</code> (any string)</td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Client Secret</td><td className="px-2 py-1.5"><em>empty</em></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Token endpoint auth method</td><td className="px-2 py-1.5 font-mono"><code>none</code></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Auth URL</td><td className="px-2 py-1.5 font-mono"><code>{hostedBase}/oauth/authorize</code></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Token URL</td><td className="px-2 py-1.5 font-mono"><code>{hostedBase}/api/oauth/token</code></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Authorization server base</td><td className="px-2 py-1.5 font-mono"><code>{hostedBase}</code></td></tr>
                <tr className="border-t"><td className="px-2 py-1.5">Resource</td><td className="px-2 py-1.5 font-mono"><code>{hostedUrl}</code></td></tr>
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
    </>
  );
}
