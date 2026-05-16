"use client";

import * as React from "react";
import {
  Sparkles, Plus, Pencil, Trash2, KeyRound, CheckCircle2, AlertTriangle, XCircle,
  ShieldCheck, Wrench, Bot, GraduationCap, Receipt, Activity,
} from "lucide-react";
import {
  PreviewPage,
  PreviewHeader,
  PROVIDERS,
  PROVIDER_GROUPS,
  TOOLS,
  SKILLS,
  AGENTS,
} from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STATUS_COLOR = {
  connected: "bg-success/15 text-success",
  error: "bg-danger/15 text-danger",
  "missing-key": "bg-warning/15 text-warning-foreground",
} as const;

const STATUS_ICON = {
  connected: CheckCircle2,
  error: XCircle,
  "missing-key": AlertTriangle,
};

const TAB_LIST = [
  { id: "providers", label: "API Sources", icon: KeyRound },
  { id: "models", label: "Models", icon: Sparkles },
  { id: "skills", label: "Skills", icon: GraduationCap },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "budgets", label: "Budgets", icon: Receipt },
  { id: "audit", label: "Audit", icon: Activity },
];

const AGENT_STATUS_COLOR = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  draft: "bg-muted text-muted-foreground",
} as const;

export default function Page() {
  return (
    <PreviewPage>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <PreviewHeader
          icon={ShieldCheck}
          title="AI Admin"
          subtitle="Manage providers, models, skills, tools, and agents. Single console for the whole AI stack."
          actions={
            <Badge variant="outline" className="border-info/40 bg-info/10 text-info">
              SUPERADMIN
            </Badge>
          }
        />

        <Tabs defaultValue="providers" className="gap-5">
          <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/30 p-1">
            {TAB_LIST.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger key={t.id} value={t.id} className="h-8 gap-1.5 px-3 text-xs">
                  <Icon className="size-3" /> {t.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ───────── API Sources ───────── */}
          <TabsContent value="providers" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {PROVIDERS.filter((p) => p.status === "connected").length} of {PROVIDERS.length}{" "}
                connected.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3" /> Add provider
              </Button>
            </div>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Provider</TableHead>
                    <TableHead>Base URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last tested</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PROVIDERS.map((p) => {
                    const Icon = STATUS_ICON[p.status];
                    return (
                      <TableRow key={p.slug}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {p.baseUrl}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("gap-1 text-[10px]", STATUS_COLOR[p.status])}>
                            <Icon className="size-3" />
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {p.lastTested ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Pencil className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ───────── Models ───────── */}
          <TabsContent value="models" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {PROVIDER_GROUPS.reduce((sum, g) => sum + g.models.length, 0)} registered models.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3" /> Register model
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {PROVIDER_GROUPS.map((g) => (
                <Card key={g.provider} className="gap-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.provider}
                  </p>
                  <ul className="space-y-1.5">
                    {g.models.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between rounded-md border border-border/40 bg-card px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{m.label}</p>
                          <p className="truncate font-mono text-[10px] text-muted-foreground">
                            {m.id}
                          </p>
                        </div>
                        {m.pricing && (
                          <Badge variant="outline" className="ml-2 shrink-0 font-mono text-[10px]">
                            {m.pricing}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ───────── Skills ───────── */}
          <TabsContent value="skills" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {SKILLS.length} skills registered.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3" /> New skill
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {SKILLS.map((s) => (
                <Card key={s.slug} className="gap-2 p-4">
                  <header className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Button variant="ghost" size="icon" className="size-7">
                      <Pencil className="size-3" />
                    </Button>
                  </header>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {s.systemPrompt}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {s.modelDefault}
                    </Badge>
                    {s.toolDefaults.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ───────── Tools ───────── */}
          <TabsContent value="tools" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {TOOLS.length} tools registered.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3" /> Register tool
              </Button>
            </div>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Tool</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sandboxed</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TOOLS.map((t) => {
                    const Icon = t.icon;
                    const sandboxed = ["shell", "code-interp", "browse"].includes(t.id);
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="size-3.5 text-muted-foreground" />}
                            <span className="font-medium text-xs">{t.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {t.description}
                        </TableCell>
                        <TableCell>
                          {sandboxed ? (
                            <Badge variant="secondary" className="bg-warning/15 text-[10px] text-warning-foreground">
                              sandboxed
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="size-7">
                            <Pencil className="size-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ───────── Agents ───────── */}
          <TabsContent value="agents" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {AGENTS.filter((a) => a.status === "active").length} active /{" "}
                {AGENTS.length} total.
              </p>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3" /> New agent
              </Button>
            </div>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Agent</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Max iter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AGENTS.map((a) => (
                    <TableRow key={a.slug}>
                      <TableCell className="font-mono font-medium">{a.name}</TableCell>
                      <TableCell className="text-xs">{a.skill}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {a.model}
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{a.maxIter}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px]", AGENT_STATUS_COLOR[a.status])}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-7">
                          <Pencil className="size-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ───────── Budgets ───────── */}
          <TabsContent value="budgets" className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="gap-1 p-4">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-bold tabular-nums">$4.12</p>
                <p className="text-[10px] text-muted-foreground">of $20.00 cap</p>
              </Card>
              <Card className="gap-1 p-4">
                <p className="text-xs text-muted-foreground">This month</p>
                <p className="text-2xl font-bold tabular-nums">$182.40</p>
                <p className="text-[10px] text-success">+12% vs last month</p>
              </Card>
              <Card className="gap-1 p-4">
                <p className="text-xs text-muted-foreground">Avg / day</p>
                <p className="text-2xl font-bold tabular-nums">$6.08</p>
                <p className="text-[10px] text-muted-foreground">over 30d</p>
              </Card>
            </div>
            <Card className="gap-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cost guard
              </p>
              <p className="text-sm">Hard cap: <span className="font-mono">$50/day</span> · alert at 80%</p>
              <p className="text-xs text-muted-foreground">Per-user soft cap: $5/day</p>
            </Card>
          </TabsContent>

          {/* ───────── Audit ───────── */}
          <TabsContent value="audit" className="space-y-3">
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tokens (in/out)</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { ts: "12:04:18", actor: "alice@acme", agent: "audit-bp", model: "claude-opus-4-7", in: "8,124", out: "1,808", cost: "$0.26", lat: "9.4s" },
                    { ts: "11:58:02", actor: "bob@acme", agent: "research", model: "gpt-5", in: "12,400", out: "3,210", cost: "$0.31", lat: "14.2s" },
                    { ts: "11:42:51", actor: "carol@acme", agent: "pr-reviewer", model: "claude-sonnet-4-6", in: "4,200", out: "812", cost: "$0.03", lat: "3.1s" },
                  ].map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{r.ts}</TableCell>
                      <TableCell className="font-mono text-[11px]">{r.actor}</TableCell>
                      <TableCell className="font-mono text-[11px]">{r.agent}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{r.model}</TableCell>
                      <TableCell className="font-mono text-[11px] tabular-nums">{r.in} / {r.out}</TableCell>
                      <TableCell className="font-mono text-[11px] tabular-nums">{r.cost}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{r.lat}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PreviewPage>
  );
}
