"use client";

import * as React from "react";
import {
  Bot, Play, Pause, CheckCircle2, XCircle, Clock, ChevronRight, Search, Wrench, FileText, Sparkles,
} from "lucide-react";
import { PreviewPage, PreviewContainer, PreviewHeader, StatGrid, AGENTS } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RunStatus = "queued" | "running" | "success" | "failed";

const RUNS: { id: string; agent: string; input: string; status: RunStatus; pct?: number; cost: string; lat: string; ts: string }[] = [
  { id: "r1842", agent: "audit-bp", input: "Audit frontend/slices/comments", status: "running", pct: 62, cost: "$0.18", lat: "12s", ts: "now" },
  { id: "r1841", agent: "research", input: "Find 5 cheap S3-compat hosts", status: "success", cost: "$0.31", lat: "18s", ts: "2m" },
  { id: "r1840", agent: "pr-reviewer", input: "Review PR #247", status: "success", cost: "$0.04", lat: "3s", ts: "4m" },
  { id: "r1839", agent: "audit-bp", input: "Audit lib/content/slices.ts", status: "failed", cost: "$0.02", lat: "1s", ts: "11m" },
  { id: "r1838", agent: "research", input: "Compare Convex vs Supabase pricing", status: "success", cost: "$0.42", lat: "24s", ts: "1h" },
  { id: "r1837", agent: "docs-writer", input: "Write README for ai-router", status: "queued", cost: "—", lat: "—", ts: "queued" },
];

const ACTIVE_STEPS = [
  { idx: 1, name: "rag.query", arg: "audit:slices comments", status: "done", lat: "0.4s" },
  { idx: 2, name: "shell.exec", arg: "rg fetch -n", status: "done", lat: "0.8s" },
  { idx: 3, name: "model.call", arg: "claude-opus-4-7", status: "running", lat: "—" },
  { idx: 4, name: "audit.score", arg: "(pending)", status: "pending", lat: "—" },
];

const STATUS_COLOR: Record<RunStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  failed: "bg-danger/15 text-danger",
};

const STATUS_ICON: Record<RunStatus, React.ComponentType<{ className?: string }>> = {
  queued: Clock,
  running: Play,
  success: CheckCircle2,
  failed: XCircle,
};

const STEP_ICON = {
  "rag.query": Search,
  "shell.exec": Wrench,
  "model.call": Sparkles,
  "audit.score": FileText,
} as const;

export default function Page() {
  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Bot}
          title="Agent Runner"
          subtitle="Async autonomous workers. Step-by-step traces, per-run cost, retry policy."
          actions={
            <Button size="sm" className="gap-1.5"><Play className="size-3" /> Run agent…</Button>
          }
        />
        <div className="mb-6">
          <StatGrid
            items={[
              { label: "Running", value: "1" },
              { label: "Queued", value: "1" },
              { label: "Done (24h)", value: "84" },
              { label: "Failed (24h)", value: "3", trend: "down", delta: "-50%" },
            ]}
            cols={4}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <p className="text-xs font-semibold">Run queue</p>
              <span className="text-[10px] text-muted-foreground">refresh every 2s</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Status</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Input</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {RUNS.map((r) => {
                  const Icon = STATUS_ICON[r.status];
                  return (
                    <TableRow key={r.id} className={cn(r.status === "running" && "bg-info/[0.03]")}>
                      <TableCell>
                        <Badge variant="secondary" className={cn("gap-1 text-[10px]", STATUS_COLOR[r.status])}>
                          <Icon className="size-3" /> {r.status}
                        </Badge>
                        {r.status === "running" && r.pct != null && (
                          <Progress value={r.pct} className="mt-1.5 h-1" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-[11px]">{r.agent}</TableCell>
                      <TableCell className="text-xs">{r.input}</TableCell>
                      <TableCell className="font-mono text-[11px] tabular-nums">{r.cost}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{r.lat}</TableCell>
                      <TableCell><ChevronRight className="size-3 text-muted-foreground" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <p className="text-xs font-semibold">Trace · r1842</p>
              <Badge variant="secondary" className="bg-info/15 text-[10px] text-info">running</Badge>
            </div>
            <div className="space-y-2 p-3">
              {ACTIVE_STEPS.map((s) => {
                const Icon = STEP_ICON[s.name as keyof typeof STEP_ICON];
                return (
                  <div
                    key={s.idx}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 transition",
                      s.status === "running" && "border-info/40 bg-info/[0.04]",
                      s.status === "pending" && "opacity-50",
                    )}
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{s.idx}.</span>
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate font-mono text-[11px]">
                      <strong>{s.name}</strong>
                      <span className="ml-2 text-muted-foreground">{s.arg}</span>
                    </span>
                    {s.status === "done" && <CheckCircle2 className="size-3 text-success" />}
                    {s.status === "running" && <Play className="size-3 animate-pulse text-info" />}
                    {s.lat !== "—" && (
                      <span className="font-mono text-[10px] text-muted-foreground">{s.lat}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
              Total: 1.2s · est. 4 more steps
            </div>
          </Card>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((a) => (
            <Card key={a.slug} className="gap-1 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="size-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs font-medium">{a.name}</span>
                </div>
                {a.status === "paused" ? (
                  <Pause className="size-3 text-warning-foreground" />
                ) : a.status === "draft" ? (
                  <Clock className="size-3 text-muted-foreground" />
                ) : (
                  <Play className="size-3 text-success" />
                )}
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{a.model}</p>
              <p className="text-[10px] text-muted-foreground">max-iter {a.maxIter} · skill {a.skill}</p>
            </Card>
          ))}
        </div>
      </PreviewContainer>
    </PreviewPage>
  );
}
