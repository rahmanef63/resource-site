"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Datum = { name: string; value: number; color?: string };

interface Props {
  title: string;
  subtitle?: string;
  data: Datum[];
}

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const fmt = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

export function PieChartCard({ title, subtitle, data }: Props) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle ? <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p> : null}
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={36} paddingAngle={2}>
              {data.map((d, i) => (
                <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
              formatter={(value) => fmt(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />
            {d.name}: <span className="tabular-nums">{fmt(d.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
