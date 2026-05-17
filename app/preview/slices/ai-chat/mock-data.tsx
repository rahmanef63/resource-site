import * as React from "react";

export const DEFAULT_TOOLS = new Set(["web-search", "rag"]);
export const DEFAULT_SKILL = "coder";

export const MOCK_MESSAGES = [
  {
    role: "user" as const,
    avatar: "RH",
    timestamp: "12:04",
    content: "Find every place we call `fetch` without an AbortController and propose a fix.",
  },
  {
    role: "tool" as const,
    timestamp: "12:04",
    content: "Calling tools to scan the workspace.",
    toolCalls: [
      {
        name: "rag.query",
        args: '{"query":"fetch( without AbortController","topK":12}',
        result: "✓ 7 hits — 5 unique files",
        status: "done" as const,
      },
      {
        name: "shell.exec",
        args: 'rg "fetch\\(" -n --type ts | rg -v "AbortController"',
        result: "frontend/slices/comments/hooks/useComments.ts:42\nlib/api/billing.ts:18\n... (5 more)",
        status: "done" as const,
      },
    ],
  },
  {
    role: "assistant" as const,
    avatar: "AI",
    timestamp: "12:05",
    status: "streaming" as const,
    content: (
      <div className="space-y-2">
        <p>
          Found <strong>7 hits across 5 files</strong>. Three of them already wrap their fetch in
          a request hook — those auto-cancel via TanStack. The remaining four leak. Proposed fix
          template:
        </p>
        <pre className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 p-3 text-[11px] leading-relaxed">
{`const ctrl = new AbortController();
const res = await fetch(url, { signal: ctrl.signal });
return () => ctrl.abort();`}
        </pre>
        <p>Want me to open a PR with the four targeted edits?</p>
      </div>
    ),
    citations: [
      { label: "comments/useComments.ts:42" },
      { label: "lib/api/billing.ts:18" },
      { label: "Convex docs · streams" },
    ],
  },
];

export const SAMPLE_ATTACHMENTS = [
  { name: "design-review.pdf", size: "1.2 MB" },
  { name: "screenshot.png", size: "284 KB" },
];
