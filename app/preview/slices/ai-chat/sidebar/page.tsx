"use client";

import * as React from "react";
import {
  Sparkles, X, Send, Check, ChevronRight, Bot, GitPullRequest, Mail, Calendar,
} from "lucide-react";
import { PreviewPage, ChatMessage } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { icon: GitPullRequest, label: "Summarize this PR", hint: "248 lines · 7 files" },
  { icon: Check, label: "Generate test cases", hint: "Based on diff" },
  { icon: Mail, label: "Draft Slack message", hint: "Notify reviewers" },
  { icon: Calendar, label: "Schedule deploy", hint: "Pick a low-traffic window" },
];

const DIFF = `- if (user.role === 'admin') { ... }
+ if (await rbac.has(user, 'manage:billing')) { ... }`;

export default function Page() {
  return (
    <PreviewPage>
      <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Mock host app left */}
        <main className="hidden flex-col bg-muted/20 lg:flex">
          <header className="flex h-12 items-center gap-3 border-b border-border/60 bg-background px-4">
            <span className="text-sm font-semibold">acme/billing</span>
            <Badge variant="secondary" className="text-[10px]">PR #248</Badge>
            <Badge variant="outline" className="font-mono text-[10px]">main ← refactor/rbac</Badge>
          </header>
          <div className="space-y-3 p-4">
            <h1 className="text-lg font-bold">Refactor billing access to RBAC</h1>
            <p className="text-sm text-muted-foreground">
              Replace role-string equality with permission lookups. 7 files · +248/-184.
            </p>
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border/60 bg-muted/30 px-3 py-2 font-mono text-[11px]">
                convex/features/billing/mutations.ts
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed">
                <code>{DIFF}</code>
              </pre>
            </Card>
            <p className="text-xs text-muted-foreground">↑ Copilot suggested this diff — see panel</p>
          </div>
        </main>

        {/* Copilot panel right */}
        <aside className="flex min-h-0 flex-col border-l border-border/60 bg-background">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background px-3">
            <div className="flex items-center gap-2">
              <div className="grid size-7 place-items-center rounded-md bg-primary/15">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold">Copilot</p>
                <p className="text-[10px] text-muted-foreground">acme/billing · PR #248</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="size-7"><X className="size-3.5" /></Button>
          </header>
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-3">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Suggestions
                </p>
                <ul className="space-y-1">
                  {SUGGESTIONS.map((s) => (
                    <li key={s.label}>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "group/sug flex h-auto w-full items-center justify-start gap-2 rounded-md border-border/40 bg-card px-2.5 py-2 text-left transition",
                          "hover:border-primary/40 hover:bg-accent",
                        )}
                      >
                        <s.icon className="size-3.5 text-muted-foreground group-hover/sug:text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">{s.label}</p>
                          <p className="text-[10px] text-muted-foreground">{s.hint}</p>
                        </div>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div className="-mx-3">
                <ChatMessage
                  role="user"
                  avatar="RH"
                  timestamp="now"
                  content="Why did you switch to await rbac.has()?"
                />
                <ChatMessage
                  role="assistant"
                  avatar="CO"
                  timestamp="just now"
                  status="streaming"
                  content={
                    <p>
                      The string check returned the wrong answer for delegated billing — a finance
                      member can be granted <code className="rounded bg-muted px-1 text-[10px]">manage:billing</code>{" "}
                      without being a workspace admin. <code>rbac.has()</code> consults the
                      permission table so delegations work.
                    </p>
                  }
                  citations={[{ label: "rbac/roles.config.ts:42" }, { label: "ADR-014" }]}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="shrink-0 border-t border-border/60 p-2">
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-2 py-1.5">
              <Bot className="size-3.5 text-muted-foreground" />
              <input
                placeholder="Ask anything about this PR…"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
              <Button size="icon" className="size-7"><Send className="size-3" /></Button>
            </div>
          </div>
        </aside>
      </div>
    </PreviewPage>
  );
}
