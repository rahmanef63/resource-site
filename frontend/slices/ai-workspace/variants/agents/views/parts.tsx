import { Activity, CheckCircle2, CircleDot, Gauge, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RunStatus, StepStatus } from "../types";

/** Badge tint per run status. */
export const RUN_STATUS_STYLE: Record<RunStatus, string> = {
  queued: "bg-muted text-muted-foreground",
  running: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done")
    return <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />;
  if (status === "error")
    return <XCircle className="size-4 text-red-500" aria-hidden />;
  if (status === "running")
    return <Activity className="size-4 animate-pulse text-blue-500" aria-hidden />;
  return <CircleDot className="size-4 text-muted-foreground" aria-hidden />;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
