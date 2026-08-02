import * as React from "react";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
  /** Optional second-line meta (e.g. delta vs last period). */
  delta?: React.ReactNode;
  /** Optional trend coloring for the delta. Defaults to muted. */
  trend?: "up" | "down" | "muted";
  /** Optional icon shown in the card header. */
  icon?: LucideIcon;
  className?: string;
};

const TREND_COLOR: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "text-success",
  down: "text-danger",
  muted: "text-muted-foreground",
};

/** Single metric card. Composes shadcn Card. */
export function StatCard({ label, value, delta, trend = "muted", icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("gap-1 p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      </div>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {delta != null && <p className={cn("mt-1 text-[10px] font-medium", TREND_COLOR[trend])}>{delta}</p>}
    </Card>
  );
}

/** Responsive auto-fit grid of stat cards.
 *  1 col on mobile → 2 col ≥ sm → 3-4 col ≥ md, depending on `cols`. */
export function StatGrid({
  items,
  cols = 4,
  className,
}: {
  items: StatCardProps[];
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const colsClass =
    cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-1 gap-3", colsClass, className)}>
      {items.map((it, i) => (
        <StatCard key={`${it.label}-${i}`} {...it} />
      ))}
    </div>
  );
}
