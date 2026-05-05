"use client";

import * as React from "react";
import { ArrowLeftRight, ExternalLink, Eye, LayoutDashboard, RefreshCw, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFeatureContext } from "./feature-context";
import { PREVIEW_PRESETS, applyRotation, type PreviewPreset } from "@/lib/preview-presets";

type Props = {
  publicSrc: string;
  adminSrc: string;
};

export function SplitPreviewPane({ publicSrc, adminSrc }: Props) {
  const { previewView, previewOrientation } = useFeatureContext();
  const [iframeKey, setIframeKey] = React.useState(0);
  const [orientation, setOrientation] = React.useState<"horizontal" | "vertical">("horizontal");

  React.useEffect(() => {
    function refresh() {
      setIframeKey((k) => k + 1);
    }
    window.addEventListener("rresource:refresh-preview", refresh);
    return () => window.removeEventListener("rresource:refresh-preview", refresh);
  }, []);

  const basePreset = PREVIEW_PRESETS[previewView];
  const preset = applyRotation(basePreset, previewOrientation);

  return (
    <div className="flex h-full flex-col bg-zinc-950/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-background/60 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <ArrowLeftRight className="size-3.5 shrink-0" />
          <span className="truncate">
            Live sync via BroadcastChannel — submit di Public, lihat di Admin (dan sebaliknya).
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
            {preset.label} · {preset.width}×{preset.height}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setOrientation((o) => (o === "horizontal" ? "vertical" : "horizontal"))}
            aria-label="Toggle split orientation"
            title={orientation === "horizontal" ? "Stack vertically" : "Side-by-side"}
          >
            <Rows3
              className={cn(
                "size-3.5 transition-transform",
                orientation === "vertical" && "rotate-90",
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setIframeKey((k) => k + 1)}
            aria-label="Refresh both"
            title="Refresh"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 overflow-hidden",
          orientation === "horizontal" ? "flex-row" : "flex-col",
        )}
      >
        <SplitPane
          key={"pub-" + iframeKey}
          src={publicSrc}
          label="Public"
          hint="visitor view"
          icon={Eye}
          tone="emerald"
          preset={preset}
        />
        <Divider orientation={orientation} />
        <SplitPane
          key={"adm-" + iframeKey}
          src={adminSrc}
          label="Admin"
          hint="owner dashboard"
          icon={LayoutDashboard}
          tone="violet"
          preset={preset}
        />
      </div>
    </div>
  );
}

function SplitPane({
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

function Divider({ orientation }: { orientation: "horizontal" | "vertical" }) {
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
