"use client";

import * as React from "react";
import { Plus, Pencil } from "lucide-react";
import { PROVIDERS, PROVIDER_GROUPS, SKILLS } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { STATUS_COLOR, STATUS_ICON, INSTRUCTIONS } from "./mock-data";
import { CreateInstructionDialog, CreateSkillDialog } from "./dialogs";

export function ProvidersTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {PROVIDERS.filter((p) => p.status === "connected").length} of {PROVIDERS.length} connected.
        </p>
        <Button size="sm" className="gap-1.5"><Plus className="size-3" /> Add provider</Button>
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
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{p.baseUrl}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("gap-1 text-[10px]", STATUS_COLOR[p.status])}>
                      <Icon className="size-3" />
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{p.lastTested ?? "—"}</TableCell>
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

export function ModelsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {PROVIDER_GROUPS.reduce((sum, g) => sum + g.models.length, 0)} registered models.
        </p>
        <Button size="sm" className="gap-1.5"><Plus className="size-3" /> Register model</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {PROVIDER_GROUPS.map((g) => (
          <Card key={g.provider} className="gap-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.provider}</p>
            <ul className="space-y-1.5">
              {g.models.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md border border-border/40 bg-card px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{m.label}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{m.id}</p>
                  </div>
                  {m.pricing && (
                    <Badge variant="outline" className="ml-2 shrink-0 font-mono text-[10px]">{m.pricing}</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function InstructionsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Reusable custom instructions. Each skill references one — change an instruction here and every agent using that skill updates.
        </p>
        <CreateInstructionDialog />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {INSTRUCTIONS.map((it) => (
          <Card key={it.slug} className="gap-2 p-4">
            <header className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{it.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{it.slug}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button>
            </header>
            <p className="line-clamp-3 text-xs text-muted-foreground">{it.body}</p>
            <Badge variant="outline" className="w-fit text-[10px]">used by {it.uses} runs</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SkillsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Skill = instruction + default model + default tools. Reuse across chats / agents.
        </p>
        <CreateSkillDialog />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {SKILLS.map((s) => (
          <Card key={s.slug} className="gap-2 p-4">
            <header className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{s.name}</p>
              <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button>
            </header>
            <p className="line-clamp-2 text-xs text-muted-foreground">{s.systemPrompt}</p>
            <div className="flex flex-wrap gap-1 pt-1">
              <Badge variant="outline" className="font-mono text-[10px]">{s.modelDefault}</Badge>
              {s.toolDefaults.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
