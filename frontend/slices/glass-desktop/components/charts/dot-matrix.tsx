// glass-desktop — DotMatrix (ported from Lucent v4). SVG-only, presentational.
// A cols×rows activity grid; each cell's intensity is derived deterministically
// from its index so the pattern is stable across renders (no data prop, no
// hydration mismatch). Decorative — no animation.
export interface DotMatrixProps {
  cols: number;
  rows: number;
  dot?: number;
  gap?: number;
  color: string;
  /** aria-label; the grid is otherwise decorative. */
  label: string;
}

// Cheap deterministic hash → [0,1). Keeps the "heatmap" stable and SSR-safe.
function intensity(i: number): number {
  const h = ((i * 2654435761) % 1000) / 1000;
  return 0.14 + 0.86 * h;
}

export function DotMatrix({ cols, rows, dot = 5, gap = 3, color, label }: DotMatrixProps) {
  const width = cols * dot + (cols - 1) * gap;
  const height = rows * dot + (rows - 1) * gap;

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      cells.push(
        <rect
          key={i}
          x={col * (dot + gap)}
          y={r * (dot + gap)}
          width={dot}
          height={dot}
          rx={Math.min(2, dot / 2)}
          fill={color}
          fillOpacity={intensity(i).toFixed(3)}
        />,
      );
    }
  }

  return (
    <svg
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {cells}
    </svg>
  );
}
