"use client";

/** Lazy chart wrapper. Recharts stays behind a browser-only dynamic import. */
import * as React from "react";
import { parseSpec, type ChartSpec } from "./chart-spec";

type Canvas = React.ComponentType<{ spec: ChartSpec }>;
let canvasReady: Promise<Canvas> | null = null;

function loadCanvas(): Promise<Canvas> {
  if (!canvasReady) {
    canvasReady = import("./ChartCanvas").then((module) => module.ChartCanvas);
  }
  return canvasReady;
}

export function ChartBlock({ text }: { text: string }) {
  const spec = React.useMemo(() => parseSpec(text), [text]);
  const [Canvas, setCanvas] = React.useState<Canvas | null>(null);

  React.useEffect(() => {
    if (!spec) return;
    let alive = true;
    void loadCanvas().then((component) => {
      if (alive) setCanvas(() => component);
    });
    return () => { alive = false; };
  }, [spec]);

  if (!spec) {
    return (
      <pre className="my-3 overflow-x-auto rounded-md border border-destructive/40 bg-muted/40 p-3 text-xs">
        <code className="font-mono">{text}</code>
      </pre>
    );
  }

  return (
    <figure className="my-3 rounded-md border border-border bg-background p-3">
      {spec.title && (
        <figcaption className="mb-2 text-center text-xs font-medium text-muted-foreground">
          {spec.title}
        </figcaption>
      )}
      {Canvas ? <Canvas spec={spec} /> : <div className="h-64 w-full animate-pulse rounded bg-muted/40" />}
    </figure>
  );
}
