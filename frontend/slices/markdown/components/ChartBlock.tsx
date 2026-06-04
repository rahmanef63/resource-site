"use client";

/** Renders a ```chart fence as a recharts chart. The fence body is a JSON
 *  spec:
 *
 *    { "type": "bar" | "line" | "area" | "pie",
 *      "data": [{ "name": "Jan", "value": 12, ... }, ...],
 *      "xKey": "name",          // category key (default "name")
 *      "series": ["value"],     // numeric keys to plot (default: all numbers)
 *      "title": "optional" }
 *
 *  Invalid JSON falls back to the raw text in a code block. Colors come from
 *  the shadcn theme tokens (--chart-1..5). */

import * as React from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

interface ChartSpec {
  type: "bar" | "line" | "area" | "pie";
  data: Array<Record<string, unknown>>;
  xKey?: string;
  series?: string[];
  title?: string;
}

function parseSpec(text: string): ChartSpec | null {
  try {
    const spec = JSON.parse(text) as ChartSpec;
    if (!spec || !Array.isArray(spec.data) || !spec.data.length) return null;
    if (!["bar", "line", "area", "pie"].includes(spec.type)) return null;
    return spec;
  } catch {
    return null;
  }
}

function seriesKeys(spec: ChartSpec): string[] {
  if (spec.series?.length) return spec.series;
  const first = spec.data[0] ?? {};
  return Object.keys(first).filter((k) => typeof first[k] === "number");
}

export function ChartBlock({ text }: { text: string }) {
  const spec = React.useMemo(() => parseSpec(text), [text]);
  if (!spec) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md border border-destructive/40 bg-muted/40 p-3 text-xs">
        <code className="font-mono">{text}</code>
      </pre>
    );
  }
  const xKey = spec.xKey ?? "name";
  const keys = seriesKeys(spec);
  return (
    <figure className="my-3 rounded-md border border-border bg-background p-3">
      {spec.title && <figcaption className="mb-2 text-center text-xs font-medium text-muted-foreground">{spec.title}</figcaption>}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(spec, xKey, keys)}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function renderChart(spec: ChartSpec, xKey: string, keys: string[]) {
  const axisProps = { tick: { fontSize: 11 }, stroke: "var(--muted-foreground)" } as const;
  switch (spec.type) {
    case "bar":
      return (
        <BarChart data={spec.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip />
          {keys.length > 1 && <Legend />}
          {keys.map((k, i) => <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />)}
        </BarChart>
      );
    case "line":
      return (
        <LineChart data={spec.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip />
          {keys.length > 1 && <Legend />}
          {keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />)}
        </LineChart>
      );
    case "area":
      return (
        <AreaChart data={spec.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip />
          {keys.length > 1 && <Legend />}
          {keys.map((k, i) => (
            <Area key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.25} />
          ))}
        </AreaChart>
      );
    case "pie": {
      const valueKey = keys[0] ?? "value";
      return (
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie data={spec.data} dataKey={valueKey} nameKey={xKey} innerRadius="45%" outerRadius="80%" paddingAngle={2}>
            {spec.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
        </PieChart>
      );
    }
  }
}
