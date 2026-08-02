import { Play, Timer } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { AgentRun } from "../types";
import { RUN_STATUS_STYLE, StepIcon } from "./parts";

/** Step-by-step trace panel for the selected run. */
export function RunTrace({ selected }: { selected: AgentRun | undefined }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="size-4" aria-hidden />
              {selected?.agentSlug ?? "—"}
            </CardTitle>
            <CardDescription className="mt-1">
              {selected?.input ?? "Select a run to inspect its trace."}
            </CardDescription>
          </div>
          {selected ? (
            <Badge
              variant="secondary"
              className={cn("capitalize", RUN_STATUS_STYLE[selected.status])}
            >
              {selected.status}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {selected && selected.steps.length > 0 ? (
          <ScrollArea className="h-[22rem] pr-3">
            <ol className="space-y-2">
              {selected.steps.map((step) => (
                <li
                  key={step.index}
                  className="flex items-start gap-3 rounded-md border bg-card p-3"
                >
                  <StepIcon status={step.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{step.name}</span>
                      <span className="text-xs text-muted-foreground">#{step.index}</span>
                    </div>
                    {step.args ? (
                      <pre className="mt-1 overflow-x-auto rounded bg-muted px-2 py-1 text-xs">
                        {step.args}
                      </pre>
                    ) : null}
                    {step.result ? (
                      <p className="mt-1 text-sm text-muted-foreground">{step.result}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-8 text-center">
            <Timer className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              No steps yet — this run is queued.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
