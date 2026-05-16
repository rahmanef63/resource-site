"use client";

import * as React from "react";
import { Sparkles, Wand2, Shuffle, Heart, Download, GitBranch, Image as ImageIcon, Code2, Type, Music } from "lucide-react";
import {
  PreviewPage, ParamSlider, ModelPicker, PROVIDER_GROUPS, DEFAULT_MODEL_ID,
} from "@/components/site/preview-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const HISTORY = [
  { id: "g1", prompt: "isometric tropical island, low-poly", ago: "now", active: true },
  { id: "g2", prompt: "noir detective in neon Tokyo, rain", ago: "2m" },
  { id: "g3", prompt: "minimalist logo, mountain + sunrise", ago: "8m" },
  { id: "g4", prompt: "watercolor field notes, botanical", ago: "1h" },
];

const VARIANTS = Array.from({ length: 4 }).map((_, i) => ({
  hue: (i * 73) % 360,
  i,
}));

export default function Page() {
  const [prompt, setPrompt] = React.useState("isometric tropical island, low-poly, vibrant sunset");
  const [outputKind, setOutputKind] = React.useState<"image" | "text" | "code" | "audio">("image");
  const [model, setModel] = React.useState(DEFAULT_MODEL_ID);
  const [variations, setVariations] = React.useState(4);
  const [creativity, setCreativity] = React.useState(0.8);

  return (
    <PreviewPage>
      <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-[1fr_300px]">
        <div className="flex min-h-0 flex-col">
          <header className="flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-semibold">Studio</span>
              <Badge variant="secondary" className="text-[10px]">{model}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 gap-1.5"><GitBranch className="size-3" /> Branch</Button>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5"><Download className="size-3" /> Export</Button>
            </div>
          </header>
          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {VARIANTS.map((v) => (
                  <Card key={v.i} className="group/v relative aspect-square overflow-hidden p-0 transition hover:shadow-lg">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `linear-gradient(135deg, hsl(${v.hue} 70% 55% / .6), hsl(${(v.hue + 90) % 360} 70% 55% / .3))`,
                      }}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.4),transparent_55%)]" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover/v:opacity-100">
                      <span className="font-mono text-[10px] text-white/80">v{v.i + 1}</span>
                      <Button variant="ghost" size="icon" className="size-6 text-white hover:bg-white/20"><Heart className="size-3" /></Button>
                    </div>
                    {v.i === 0 && (
                      <Badge className="absolute right-2 top-2 bg-primary/90 text-[10px]">Selected</Badge>
                    )}
                  </Card>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Generated 4 variations in 3.2s · click any to refine
              </p>
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 bg-background/80 p-3 backdrop-blur sm:p-4">
            <Card className="gap-2 p-3 sm:p-4">
              <Tabs value={outputKind} onValueChange={(v) => setOutputKind(v as "image")}>
                <TabsList className="h-7 bg-muted/40 p-0.5">
                  <TabsTrigger value="image" className="h-6 gap-1 px-2 text-[10px]"><ImageIcon className="size-3" /> Image</TabsTrigger>
                  <TabsTrigger value="text" className="h-6 gap-1 px-2 text-[10px]"><Type className="size-3" /> Text</TabsTrigger>
                  <TabsTrigger value="code" className="h-6 gap-1 px-2 text-[10px]"><Code2 className="size-3" /> Code</TabsTrigger>
                  <TabsTrigger value="audio" className="h-6 gap-1 px-2 text-[10px]"><Music className="size-3" /> Audio</TabsTrigger>
                </TabsList>
              </Tabs>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want…"
                rows={2}
                className="resize-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-7"><Shuffle className="size-3.5" /></Button>
                <span className="ml-auto text-[10px] text-muted-foreground">⌘↵ to generate</span>
                <Button size="sm" className="gap-1.5"><Wand2 className="size-3" /> Generate</Button>
              </div>
            </Card>
          </div>
        </div>
        <aside className="hidden flex-col border-l border-border/60 bg-muted/20 lg:flex">
          <ScrollArea className="flex-1">
            <section className="space-y-3 px-3 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Model</h3>
              <ModelPicker value={model} onValueChange={setModel} groups={PROVIDER_GROUPS} size="sm" />
            </section>
            <Separator />
            <section className="space-y-3 px-3 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Controls</h3>
              <ParamSlider label="Variations" value={variations} onValueChange={setVariations} min={1} max={8} step={1} format={(v) => v.toString()} />
              <ParamSlider label="Creativity" value={creativity} onValueChange={setCreativity} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} hint="Higher = more surprising outputs." />
            </section>
            <Separator />
            <section className="space-y-2 px-3 py-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">History</h3>
              <ul className="space-y-0.5">
                {HISTORY.map((h) => (
                  <li key={h.id}>
                    <button
                      className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                        h.active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <span className="flex-1 line-clamp-2">{h.prompt}</span>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/70">{h.ago}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </ScrollArea>
        </aside>
      </div>
    </PreviewPage>
  );
}
