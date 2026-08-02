import { Activity, Bot, Gauge, ListChecks, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { AgentRun } from "../types";
import { DEMO_AGENTS } from "./demo";
import { RUN_STATUS_STYLE } from "./parts";
import { RunTrace } from "./RunTrace";

/** Runs / Trace / Agents tab set for the agents dashboard. */
export function AgentTabs({
  runs,
  selectedId,
  onSelect,
  onRun,
}: {
  runs: AgentRun[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRun: () => void;
}) {
  const selected = runs.find((r) => r.id === selectedId) ?? runs[0];

  return (
    <Tabs defaultValue="runs" className="mt-4">
      <TabsList>
        <TabsTrigger value="runs">
          <ListChecks className="size-4" aria-hidden />
          Runs
        </TabsTrigger>
        <TabsTrigger value="trace">
          <Activity className="size-4" aria-hidden />
          Trace
        </TabsTrigger>
        <TabsTrigger value="agents">
          <Bot className="size-4" aria-hidden />
          Agents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="runs" className="mt-3">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Steps</TableHead>
                <TableHead className="text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow
                  key={run.id}
                  data-state={run.id === selectedId ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onSelect(run.id)}
                >
                  <TableCell className="font-medium">{run.agentSlug}</TableCell>
                  <TableCell className="max-w-[22rem] truncate text-muted-foreground">
                    {run.input}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("capitalize", RUN_STATUS_STYLE[run.status])}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{run.steps.length}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {run.latencyMs ? `${(run.latencyMs / 1000).toFixed(1)}s` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="trace" className="mt-3">
        <RunTrace selected={selected} />
      </TabsContent>

      <TabsContent value="agents" className="mt-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_AGENTS.map((agent) => (
            <Card key={agent.slug}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="size-4 text-primary" aria-hidden />
                  {agent.name}
                </CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{agent.slug}</span>
                  <span className="flex items-center gap-1">
                    <Gauge className="size-3.5" aria-hidden />
                    {agent.runs} runs
                  </span>
                </div>
                <Progress value={Math.min(100, agent.runs * 2)} />
                <Button variant="outline" size="sm" className="w-full" onClick={onRun}>
                  <Play className="size-4" aria-hidden />
                  Run
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
