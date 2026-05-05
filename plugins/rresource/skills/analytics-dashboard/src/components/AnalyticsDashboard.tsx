// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export type Series = { key: string; label: string; color?: string };
export type Point = Record<string, number | string>;

type Props = {
  data: Point[];
  series: Series[];
  xKey?: string;
  type?: "line" | "bar";
  height?: number;
  className?: string;
};

export function AnalyticsDashboard({ data, series, xKey = "date", type = "line", height = 280, className }: Props) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {series.map((s) => (
              <Line key={s.key} dataKey={s.key} stroke={s.color ?? "currentColor"} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            {series.map((s) => <Bar key={s.key} dataKey={s.key} fill={s.color ?? "currentColor"} />)}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
