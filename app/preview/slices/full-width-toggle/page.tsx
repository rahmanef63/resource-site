"use client";

import * as React from "react";
import { Maximize2, Minimize2, ArrowLeftRight } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type WidthMode = "contained" | "wide" | "full";

const WIDTH_CLASS: Record<WidthMode, string> = {
  contained: "max-w-7xl",
  wide: "max-w-screen-2xl",
  full: "max-w-none",
};

const PX: Record<WidthMode, string> = {
  contained: "1280px",
  wide: "1536px",
  full: "100%",
};

export default function Page() {
  const [mode, setMode] = React.useState<WidthMode>("contained");

  return (
    <SlicePreviewLayout
      title="Full Width Toggle"
      kind="ui"
      description="Page-container width preference with three modes. Switch and watch the inner content reflow."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/full-width-toggle"
    >
      <PreviewSection title="Live demo — toggle the mode" hint={`Current: ${mode} (${PX[mode]})`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SegmentToggle value={mode} onChange={setMode} />
          <IconToggle value={mode} onChange={setMode} />
        </div>

        <div className="rounded-md border border-dashed border-border/60 bg-background/50 p-2">
          <div className={cn("mx-auto rounded-md border bg-card p-4 transition-all duration-300", WIDTH_CLASS[mode])}>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Inner container</div>
              <Badge variant="outline" className="font-mono text-[10px]">{PX[mode]}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-3 text-xs">
                  <div className="font-medium">Card {i + 1}</div>
                  <div className="mt-1 text-muted-foreground">Reflows when mode changes.</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="3 modes" hint="Use case per row">
        <div className="grid gap-3 md:grid-cols-3">
          <ModeCard icon={Minimize2} label="contained" px="max-w-7xl" desc="Default. Reading-comfortable for dashboards, settings pages, blog posts." />
          <ModeCard icon={ArrowLeftRight} label="wide" px="max-w-screen-2xl" desc="Denser dashboards. More columns visible without horizontal scroll." />
          <ModeCard icon={Maximize2} label="full" px="w-full" desc="Edge-to-edge. Data tables, kanban boards, fullscreen IDE-like surfaces." />
        </div>
      </PreviewSection>

      <PreviewSection title="3 button variants">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">icon</span>
            <IconToggle value={mode} onChange={setMode} />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">button</span>
            <ButtonToggle value={mode} onChange={setMode} />
          </div>
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">segment</span>
            <SegmentToggle value={mode} onChange={setMode} />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring" hint="3-line install">
        <CodeBlock>{`import { WidthContainer, FullWidthToggle } from "@/features/full-width-toggle";

<WidthContainer as="main">{children}</WidthContainer>
<FullWidthToggle variant="segment" />`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function ModeCard({
  icon: Icon,
  label,
  px,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  px: string;
  desc: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}</span>
        <code className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px]">{px}</code>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
    </Card>
  );
}

function IconToggle({ value, onChange }: { value: WidthMode; onChange: (m: WidthMode) => void }) {
  const order: WidthMode[] = ["contained", "wide", "full"];
  const Icon = value === "contained" ? Minimize2 : value === "wide" ? ArrowLeftRight : Maximize2;
  return (
    <Button variant="ghost" size="icon" onClick={() => onChange(order[(order.indexOf(value) + 1) % 3])} aria-label="cycle">
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function ButtonToggle({ value, onChange }: { value: WidthMode; onChange: (m: WidthMode) => void }) {
  const order: WidthMode[] = ["contained", "wide", "full"];
  const Icon = value === "contained" ? Minimize2 : value === "wide" ? ArrowLeftRight : Maximize2;
  return (
    <Button variant="ghost" size="sm" onClick={() => onChange(order[(order.indexOf(value) + 1) % 3])}>
      <Icon className="h-4 w-4" />
      <span className="ml-1.5 capitalize">{value}</span>
    </Button>
  );
}

function SegmentToggle({ value, onChange }: { value: WidthMode; onChange: (m: WidthMode) => void }) {
  const order: WidthMode[] = ["contained", "wide", "full"];
  return (
    <div className="inline-flex rounded-md border border-input p-0.5">
      {order.map((m) => {
        const Icon = m === "contained" ? Minimize2 : m === "wide" ? ArrowLeftRight : Maximize2;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition",
              value === m ? "bg-accent font-medium" : "hover:bg-accent/50 text-muted-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{m}</span>
          </button>
        );
      })}
    </div>
  );
}
