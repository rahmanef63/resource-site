"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { TOOLS, AGENTS } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_COLOR, AUDIT_ROWS } from "./mock-data";
import { CreateToolDialog, CreateAgentDialog } from "./dialogs";

export function ToolsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{TOOLS.length} tools registered.</p>
        <CreateToolDialog />
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
                  <TableCell className="text-xs text-muted-foreground">{t.description}</TableCell>
                  <TableCell>
                    {sandboxed ? (
                      <Badge variant="secondary" className="bg-warning/15 text-[10px] text-warning-foreground">sandboxed</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function AgentsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {AGENTS.filter((a) => a.status === "active").length} active / {AGENTS.length} total.
        </p>
        <CreateAgentDialog />
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
                <TableCell className="font-mono text-[11px] text-muted-foreground">{a.model}</TableCell>
                <TableCell className="font-mono text-xs tabular-nums">{a.maxIter}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-[10px]", AGENT_STATUS_COLOR[a.status])}>{a.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function BudgetsTab() {
  return (
    <div className="space-y-3">
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
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cost guard</p>
        <p className="text-sm">Hard cap: <span className="font-mono">$50/day</span> · alert at 80%</p>
        <p className="text-xs text-muted-foreground">Per-user soft cap: $5/day</p>
      </Card>
    </div>
  );
}

export function AuditTab() {
  return (
    <div className="space-y-3">
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
            {AUDIT_ROWS.map((r, i) => (
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
    </div>
  );
}
