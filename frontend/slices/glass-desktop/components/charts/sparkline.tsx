// glass-desktop — Sparkline (ported from Lucent v4). SVG-only, presentational.
// A single-stroke trend line normalised into a fixed viewBox and stretched to
// the container width; optional soft area fill under the line. No animation.
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  points: number[];
  color: string;
  height?: number;
  fill?: boolean;
  style?: CSSProperties;
  className?: string;
}

const VIEW_W = 100;

export function Sparkline({ points, color, height = 40, fill = false, style, className }: SparklineProps) {
  if (points.length === 0) {
    return <svg width="100%" height={height} style={style} className={className} aria-hidden="true" />;
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const stepX = points.length > 1 ? VIEW_W / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L ${VIEW_W} ${height} L 0 ${height} Z`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${VIEW_W} ${height}`}
      preserveAspectRatio="none"
      style={style}
      className={cn(className)}
      aria-hidden="true"
    >
      {fill ? <path d={area} fill={color} fillOpacity={0.14} stroke="none" /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
