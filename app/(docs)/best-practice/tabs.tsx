"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { DocCard } from "@/components/site/doc-primitives";
import type { BestPracticeSection } from "@/lib/content/best-practices";

type Props = {
  sections: BestPracticeSection[];
  prompt: string;
};

export function BestPracticeTabs({ sections, prompt }: Props) {
  return (
    <Tabs defaultValue="docs" className="w-full">
      <TabsList className="grid w-full max-w-sm grid-cols-2">
        <TabsTrigger value="docs">Docs</TabsTrigger>
        <TabsTrigger value="ai-prompt">AI Prompt</TabsTrigger>
      </TabsList>

      <TabsContent value="docs" className="mt-6 space-y-10">
        {sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
              {section.intro && (
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                  {section.intro}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              {section.rules.map((r) => (
                <DocCard key={r.title} className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.rule}</p>
                  {r.why && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Why:</span>{" "}
                      {r.why}
                    </p>
                  )}
                  {r.example && (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
                      {r.example}
                    </pre>
                  )}
                </DocCard>
              ))}
            </div>
          </section>
        ))}
      </TabsContent>

      <TabsContent value="ai-prompt" className="mt-6 space-y-4">
        <DocCard className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">One-paste agent prompt</h2>
              <p className="text-xs text-muted-foreground">
                Paste at the start of your AI session (Claude, ChatGPT, Cursor,
                Codex, etc.). Stays in sync with the Docs tab — edit{" "}
                <code className="text-[11px]">lib/content/best-practices.ts</code>{" "}
                in rr and both refresh together.
              </p>
            </div>
            <CopyButton text={prompt} />
          </div>
          <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs font-mono whitespace-pre-wrap">
            {prompt}
          </pre>
        </DocCard>
        <details className="rounded-lg border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-semibold">How to use</summary>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <p>
              <strong>Claude Code / Cursor:</strong> save the prompt to{" "}
              <code>.claude/agents/rr-rules.md</code> or your editor's project-rules
              file. The agent picks it up on every session.
            </p>
            <p>
              <strong>ChatGPT custom GPT:</strong> paste into the "Instructions"
              field on the GPT builder. The GPT applies the rules globally.
            </p>
            <p>
              <strong>ChatGPT regular session:</strong> paste at the start of a
              new chat as a system message. Repeat per chat (no persistence).
            </p>
            <p>
              <strong>MCP integration:</strong> if your app exposes an MCP server
              (see the <code>create-your-mcp</code> slice), put a shortened version
              of this prompt in the server's <code>initialize.instructions</code>{" "}
              field so connected AI clients pick it up automatically.
            </p>
          </div>
        </details>
      </TabsContent>
    </Tabs>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silent fail
    }
  };
  return (
    <Button size="sm" variant="outline" onClick={copy} className="shrink-0">
      {copied ? (
        <>
          <Check className="size-3.5" /> Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" /> Copy
        </>
      )}
    </Button>
  );
}
