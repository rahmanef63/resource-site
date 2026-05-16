"use client";

import * as React from "react";
import {
  Plus, MessageSquare, History, RefreshCw, GitBranch, Share2, Trash2, ChevronDown,
} from "lucide-react";
import {
  PreviewPage,
  ChatMessage,
  Composer,
  ModelPicker,
  ToolToggleList,
  ParamSlider,
  PROVIDER_GROUPS,
  DEFAULT_MODEL_ID,
  TOOLS,
  SKILLS,
  SAMPLE_THREADS,
  useToggleSet,
} from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const DEFAULT_TOOLS = new Set(["web-search", "rag"]);
const DEFAULT_SKILL = "coder";

const MOCK_MESSAGES = [
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

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 px-3 py-3">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

export default function Page() {
  const [draft, setDraft] = React.useState("");
  const [model, setModel] = React.useState(DEFAULT_MODEL_ID);
  const [skill, setSkill] = React.useState(DEFAULT_SKILL);
  const [temperature, setTemperature] = React.useState(0.7);
  const [topP, setTopP] = React.useState(0.95);
  const [maxTokens, setMaxTokens] = React.useState(4096);
  const tools = useToggleSet<string>(DEFAULT_TOOLS);
  const activeSkill = SKILLS.find((s) => s.slug === skill) ?? SKILLS[0];

  return (
    <PreviewPage>
      <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* ───── LEFT — threads / attachments / tools ───── */}
        <aside className="hidden flex-col border-r border-border/60 bg-muted/20 lg:flex">
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-sm font-semibold">Chats</span>
            <Button size="sm" className="h-7 gap-1.5">
              <Plus className="size-3" /> New
            </Button>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <Section title="Threads">
              <ul className="space-y-0.5">
                {SAMPLE_THREADS.map((t, i) => (
                  <li key={t.id}>
                    <button
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition",
                        i === 0
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <MessageSquare className="size-3 shrink-0" />
                      <span className="flex-1 truncate">{t.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground/70">{t.ts}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
            <Separator />
            <Section
              title="Attachments"
              action={<Button variant="ghost" size="icon" className="size-5"><Plus className="size-3" /></Button>}
            >
              <div className="space-y-1 text-[11px]">
                {[
                  { name: "design-review.pdf", size: "1.2 MB" },
                  { name: "screenshot.png", size: "284 KB" },
                ].map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded border border-border/40 bg-card px-2 py-1.5"
                  >
                    <span className="truncate font-mono">{a.name}</span>
                    <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{a.size}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Separator />
            <Section title="Tools active">
              <ToolToggleList items={TOOLS.slice(0, 6)} active={tools.set} onToggle={tools.toggle} />
            </Section>
          </ScrollArea>
        </aside>

        {/* ───── CENTER — messages + composer ───── */}
        <div className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/70 px-4 py-2 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2">
              <Badge variant="outline" className="gap-1 font-mono text-[10px]">
                <History className="size-3" /> {activeSkill.name}
              </Badge>
              <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                {activeSkill.systemPrompt}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px]">
              <ChevronDown className="size-3" /> System prompt
            </Button>
          </header>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/40">
              {MOCK_MESSAGES.map((m, i) => (
                <ChatMessage
                  key={i}
                  {...m}
                  actions={
                    <>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <RefreshCw className="size-3" /> Regen
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <GitBranch className="size-3" /> Branch
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]">
                        <Share2 className="size-3" /> Copy
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur">
            <Composer
              value={draft}
              onValueChange={setDraft}
              onSubmit={() => setDraft("")}
              placeholder="Reply, or ⌘K for commands…"
              attachments={[
                { id: "a1", name: "design-review.pdf", mime: "application/pdf", sizeKb: 1240 },
              ]}
              onAttach={() => {}}
              onVoice={() => {}}
              onRemoveAttachment={() => {}}
              hint={
                <>
                  Using <span className="font-semibold text-foreground">{activeSkill.name}</span> skill ·{" "}
                  <span className="font-mono">{tools.size} tools active</span>
                </>
              }
            />
          </div>
        </div>

        {/* ───── RIGHT — model + params + skills + actions ───── */}
        <aside className="hidden flex-col border-l border-border/60 bg-muted/20 lg:flex">
          <ScrollArea className="flex-1">
            <Section title="Model">
              <ModelPicker value={model} onValueChange={setModel} groups={PROVIDER_GROUPS} size="sm" />
            </Section>
            <Separator />
            <Section title="Params">
              <div className="space-y-3">
                <ParamSlider label="Temperature" value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.05} format={(v) => v.toFixed(2)} hint="Higher = more diverse." />
                <ParamSlider label="Top-p" value={topP} onValueChange={setTopP} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
                <ParamSlider label="Max tokens" value={maxTokens} onValueChange={setMaxTokens} min={256} max={32768} step={256} format={(v) => v.toLocaleString()} />
              </div>
            </Section>
            <Separator />
            <Section title="Skill">
              <div className="grid grid-cols-2 gap-1.5">
                {SKILLS.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => setSkill(s.slug)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-left text-[11px] transition",
                      skill === s.slug
                        ? "border-primary/50 bg-primary/[0.05] text-foreground"
                        : "border-border/60 bg-card text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <p className="font-medium">{s.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                      {s.modelDefault}
                    </p>
                  </button>
                ))}
              </div>
            </Section>
            <Separator />
            <Section title="Actions">
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                  <RefreshCw className="size-3" /> Regenerate
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                  <GitBranch className="size-3" /> Branch
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                  <Share2 className="size-3" /> Export
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px] text-danger hover:text-danger">
                  <Trash2 className="size-3" /> Clear
                </Button>
              </div>
            </Section>
          </ScrollArea>
          <Card className="m-3 gap-1 p-3 text-[11px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Usage (this thread)
            </p>
            <p className="font-mono text-foreground">12,418 in · 3,184 out</p>
            <p className="font-mono text-muted-foreground">$0.43 — claude-opus-4-7</p>
          </Card>
        </aside>
      </div>
    </PreviewPage>
  );
}
