"use client";

import * as React from "react";
import { Bot, Plus, Pencil, Calendar, RefreshCw, ShieldAlert } from "lucide-react";
import { PreviewPage, PreviewContainer, PreviewHeader, ParamSlider, AGENTS } from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AGENT_STATUS_COLOR = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning-foreground",
  draft: "bg-muted text-muted-foreground",
} as const;

const SCHEDULES = [
  { agent: "audit-bp", cron: "0 */6 * * *", desc: "Every 6 hours", on: true },
  { agent: "research", cron: "0 9 * * MON", desc: "Mondays 9am", on: true },
  { agent: "docs-writer", cron: "—", desc: "On-demand only", on: false },
];

export default function Page() {
  const [maxConcurrency, setMaxConcurrency] = React.useState(4);
  const [retryAttempts, setRetryAttempts] = React.useState(3);

  return (
    <PreviewPage>
      <PreviewContainer size="wide">
        <PreviewHeader
          icon={Bot}
          title="Agent Runner · Admin"
          subtitle="Agent definitions, schedules, concurrency caps, retry policy."
          actions={<Button size="sm" className="gap-1.5"><Plus className="size-3" /> New agent</Button>}
        />
        <Tabs defaultValue="agents" className="gap-5">
          <TabsList className="bg-muted/30 p-1">
            <TabsTrigger value="agents" className="h-8 gap-1.5 px-3 text-xs"><Bot className="size-3" /> Agents</TabsTrigger>
            <TabsTrigger value="schedule" className="h-8 gap-1.5 px-3 text-xs"><Calendar className="size-3" /> Schedules</TabsTrigger>
            <TabsTrigger value="policy" className="h-8 gap-1.5 px-3 text-xs"><RefreshCw className="size-3" /> Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-3">
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Agent</TableHead>
                    <TableHead>Skill</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Max-iter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AGENTS.map((a) => (
                    <TableRow key={a.slug}>
                      <TableCell className="font-mono text-xs font-medium">{a.name}</TableCell>
                      <TableCell className="text-xs">{a.skill}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{a.model}</TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">{a.maxIter}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px]", AGENT_STATUS_COLOR[a.status])}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-7"><Pencil className="size-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-3">
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Agent</TableHead>
                    <TableHead>Cron</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCHEDULES.map((s) => (
                    <TableRow key={s.agent}>
                      <TableCell className="font-mono text-xs">{s.agent}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{s.cron}</TableCell>
                      <TableCell className="text-xs">{s.desc}</TableCell>
                      <TableCell><Switch defaultChecked={s.on} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <Button variant="outline" size="sm" className="w-full">+ Add schedule</Button>
          </TabsContent>

          <TabsContent value="policy" className="space-y-3">
            <Card className="gap-4 p-5">
              <ParamSlider
                label="Max concurrent runs"
                value={maxConcurrency}
                onValueChange={setMaxConcurrency}
                min={1} max={16} step={1}
                format={(v) => v.toString()}
                hint="Across all agents in this workspace."
              />
              <ParamSlider
                label="Retry attempts"
                value={retryAttempts}
                onValueChange={setRetryAttempts}
                min={0} max={5} step={1}
                format={(v) => v.toString()}
              />
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Backoff</Label>
                <Input defaultValue="exponential 2s → 64s" className="font-mono text-xs" />
              </div>
            </Card>
            <Card className="gap-2 p-5">
              <div className="flex items-start gap-2">
                <ShieldAlert className="size-4 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Hard cost cap (per agent / day)</p>
                  <p className="text-xs text-muted-foreground">Kill switch when an agent burns more than this.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Input defaultValue="$5.00" className="max-w-[140px] font-mono text-xs" />
                <Switch defaultChecked />
                <span className="text-xs text-muted-foreground">Enforce</span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PreviewContainer>
    </PreviewPage>
  );
}
