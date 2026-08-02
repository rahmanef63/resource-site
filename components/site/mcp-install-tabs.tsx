"use client";

import * as React from "react";
import { Terminal, Code2, Bot, Cloud, Wrench } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CLAUDE_CONFIG, CURSOR_CONFIG } from "@/components/site/mcp/constants";
import { ChatGptHostedTab } from "@/components/site/mcp/chatgpt-hosted-tab";
import { SelfHostTab } from "@/components/site/mcp/self-host-tab";

const HOSTED_URL =
  process.env.NEXT_PUBLIC_MCP_SERVER_URL ?? "https://mcp-resource.rahmanef.com/mcp";
const HOSTED_BASE = HOSTED_URL.replace(/\/mcp\/?$/, "");

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

            <TabsContent value="hosted" className="space-y-4 pt-4">
              <ChatGptHostedTab hostedUrl={HOSTED_URL} hostedBase={HOSTED_BASE} />
            </TabsContent>

            <TabsContent value="self" className="space-y-4 pt-4">
              <SelfHostTab />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </section>
  );
}
