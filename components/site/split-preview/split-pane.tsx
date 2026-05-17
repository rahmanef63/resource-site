"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PreviewPreset } from "@/lib/preview-presets";

export function SplitPane({
  src,
  label,
  hint,
  icon: Icon,
  tone,
  preset,
}: {
  src: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "violet";
  preset: PreviewPreset;
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
    violet: "bg-violet-500/15 text-violet-300 hover:bg-violet-500/15",
  };

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  // Recompute scale to fit iframe width into pane width.
  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const sx = (w - 24) / preset.width;
      const sy = (h - 24) / preset.height;
      const s = Math.min(sx, sy, 1.2);
      setScale(Math.max(0.25, s));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preset.width, preset.height]);

  const isDesktopFit = preset.width >= 1280;

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Badge className={cn("rounded-full text-[10px]", tones[tone])}>
            <Icon className="mr-1 size-3" /> {label}
          </Badge>
          <span className="truncate text-[11px] text-muted-foreground">{hint}</span>
        </div>
        <span className="ml-2 hidden font-mono text-[10px] text-muted-foreground md:inline">
          {Math.round(scale * 100)}%
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Open ${label} in new tab`}
          title={`Open ${label} in new tab`}
        >
          <ExternalLink className="size-3" />
        </a>
      </div>
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-auto bg-zinc-950/40 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.zinc.700/.4)_1px,transparent_0)] [background-size:14px_14px]"
      >
        {isDesktopFit ? (
          <iframe
            src={src}
            title={`${label} preview`}
            loading="lazy"
            className="h-full w-full border-0 bg-background"
          />
        ) : (
          <div className="flex min-h-full justify-center p-3">
            <div
              className="relative shrink-0"
              style={{
                width: preset.width * scale,
                height: preset.height * scale,
              }}
            >
              <div
                style={{
                  width: preset.width,
                  height: preset.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
                className="overflow-hidden rounded-md border bg-background shadow-2xl"
              >
                <iframe
                  src={src}
                  title={`${label} preview`}
                  loading="lazy"
                  className="h-full w-full border-0 bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SplitDivider({ orientation }: { orientation: "horizontal" | "vertical" }) {
  if (orientation === "horizontal") {
    return (
      <div className="flex w-2 shrink-0 items-center justify-center bg-border/40">
        <div className="h-12 w-0.5 rounded-full bg-zinc-500/60" />
      </div>
    );
  }
  return (
    <div className="flex h-2 shrink-0 items-center justify-center bg-border/40">
      <div className="h-0.5 w-12 rounded-full bg-zinc-500/60" />
    </div>
  );
}
