"use client";

import * as React from "react";
import { Plus, MessageSquare, RefreshCw, GitBranch, Share2, Trash2 } from "lucide-react";
import {
  ModelPicker,
  ToolToggleList,
  ParamSlider,
  PROVIDER_GROUPS,
  TOOLS,
  SKILLS,
  SAMPLE_THREADS,
} from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SAMPLE_ATTACHMENTS } from "./mock-data";

export function Section({
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

export function LeftPanel({
  toolsSet,
  toolsToggle,
}: {
  toolsSet: Set<string>;
  toolsToggle: (id: string) => void;
}) {
  return (
    <>
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
                <Button
                  variant="ghost"
                  type="button"
                  className={cn(
                    "flex h-auto w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition",
                    i === 0
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <MessageSquare className="size-3 shrink-0" />
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70">{t.ts}</span>
                </Button>
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
            {SAMPLE_ATTACHMENTS.map((a) => (
              <div key={a.name} className="flex items-center justify-between rounded border border-border/40 bg-card px-2 py-1.5">
                <span className="truncate font-mono">{a.name}</span>
                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{a.size}</span>
              </div>
            ))}
          </div>
        </Section>
        <Separator />
        <Section title="Tools active">
          <ToolToggleList items={TOOLS.slice(0, 6)} active={toolsSet} onToggle={toolsToggle} />
        </Section>
      </ScrollArea>
    </>
  );
}

export function RightPanel({
  model,
  setModel,
  skill,
  setSkill,
  temperature,
  setTemperature,
  topP,
  setTopP,
  maxTokens,
  setMaxTokens,
}: {
  model: string;
  setModel: (v: string) => void;
  skill: string;
  setSkill: (v: string) => void;
  temperature: number;
  setTemperature: (v: number) => void;
  topP: number;
  setTopP: (v: number) => void;
  maxTokens: number;
  setMaxTokens: (v: number) => void;
}) {
  return (
    <>
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
              <Button
                key={s.slug}
                variant="outline"
                type="button"
                onClick={() => setSkill(s.slug)}
                className={cn(
                  "flex h-auto flex-col items-start gap-0 rounded-md px-2 py-2 text-left text-[11px] transition",
                  skill === s.slug
                    ? "border-primary/50 bg-primary/[0.05] text-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                <p className="font-medium">{s.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground/80">{s.modelDefault}</p>
              </Button>
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
    </>
  );
}
