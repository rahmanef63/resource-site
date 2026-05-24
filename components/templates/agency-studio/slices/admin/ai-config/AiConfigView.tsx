"use client";

import * as React from "react";
import { Bot, Play, RotateCcw, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useStore } from "../../../shared/store";
import { AI_MODELS, AI_TONES } from "../../../shared/ai-config-seed";
import type { AiTone } from "../../../shared/types";

export function AiConfigView() {
  const { state, dispatch } = useStore();
  const cfg = state.aiConfig;

  const [draft, setDraft] = React.useState(cfg.playgroundDraft);
  const [response, setResponse] = React.useState(cfg.playgroundResponse);
  const [running, setRunning] = React.useState(false);

  const update = <K extends keyof typeof cfg>(key: K, value: (typeof cfg)[K]) => {
    dispatch({ type: "ai-config.update", patch: { [key]: value } as Partial<typeof cfg> });
  };

  const reset = () => {
    if (!confirm("Reset semua AI config ke default?")) return;
    dispatch({ type: "ai-config.reset" });
    toast.success("AI config direset");
  };

  const save = () => {
    dispatch({ type: "ai-config.update", patch: { playgroundDraft: draft, playgroundResponse: response } });
    toast.success("AI config tersimpan");
  };

  const run = async () => {
    setRunning(true);
    setResponse("");
    // Synthetic streaming-style response — keeps demo deterministic.
    const tone = cfg.tone;
    const sample = tone === "Executive"
      ? `Outcome: brand system mengurangi onboarding friction 32% di Q1. Trade-off: butuh 4 minggu kerja desainer senior. Rekomendasi: lanjut ke Phase 2 dengan budget Rp 250jt.`
      : tone === "Concise"
        ? `Brand = kontrak operasional. Bukan deck. Bukan logo. Operator harus pakai harian — kalau tidak, sistem mati.`
        : tone === "Storyteller"
          ? `Tiga tahun lalu, Northwind kehilangan kontrak Rp 4 milyar karena sales tidak bisa menjelaskan apa yang mereka jual. Kami diundang. Tiga workshop kemudian, satu kalimat positioning lahir — dan tim sales menutup deal pertama 14 hari setelahnya.`
          : tone === "Friendly"
            ? `Hi! Bayangkan brand system sebagai bahasa internal tim Anda. Kalau tim engineering, sales, dan support bicara bahasa berbeda — produk jadi terasa pecah. Kontrak operasional, intinya.`
            : `Field note dari Northwind Q1: tim sales mulai pakai positioning baru pada day 9, bukan day 1. Lag-nya bukan dari training — dari kebiasaan. Coach 1:1, bukan workshop massal.`;
    for (let i = 1; i <= sample.length; i += 3) {
      await new Promise((r) => setTimeout(r, 8));
      setResponse(sample.slice(0, i));
    }
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI configuration</h1>
          <p className="text-sm text-muted-foreground">
            {AI_MODELS.length} models · {AI_TONES.length} tone presets · synthetic playground for design-system iteration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RotateCcw className="size-3.5" /> Reset
          </Button>
          <Button size="sm" onClick={save} className="gap-1.5">
            <Save className="size-3.5" /> Save config
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-5 p-5 text-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Model</p>
              <div className="grid gap-1.5">
                {AI_MODELS.map((m) => (
                  <Button
                    key={m.id}
                    variant={cfg.model === m.id ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => update("model", m.id)}
                    className="h-auto justify-between rounded-md px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="size-3.5 text-muted-foreground" />
                      {m.label}
                    </span>
                    <Badge variant="outline" className="rounded-full text-[10px]">{m.vendor}</Badge>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tone preset</p>
              <div className="flex flex-wrap gap-1.5">
                {AI_TONES.map((t) => (
                  <Button
                    key={t.value}
                    variant={cfg.tone === t.value ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => update("tone", t.value as AiTone)}
                    className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {AI_TONES.find((t) => t.value === cfg.tone)?.hint}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Temperature</p>
                <Badge variant="outline" className="rounded-full font-mono text-[10px]">
                  {cfg.temperature.toFixed(2)}
                </Badge>
              </div>
              <Input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={cfg.temperature}
                onChange={(e) => update("temperature", parseFloat(e.target.value))}
                className="h-2 accent-foreground"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.0 deterministic</span>
                <span>0.5 balanced</span>
                <span>1.0 creative</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">System prompt</p>
              <Textarea
                value={cfg.systemPrompt}
                onChange={(e) => update("systemPrompt", e.target.value)}
                rows={8}
                className="font-mono text-xs leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Playground</p>
              <Button size="sm" onClick={run} disabled={running} className="h-7 gap-1.5">
                {running ? <Sparkles className="size-3.5 animate-pulse" /> : <Play className="size-3.5" />}
                {running ? "Running…" : "Run prompt"}
              </Button>
            </div>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Prompt — tone preset dan system prompt akan diterapkan saat Run."
              className="font-mono text-xs"
            />
            <div className="rounded-md border border-border/60 bg-background/40 p-3 text-xs leading-relaxed">
              {response ? (
                <p>{response}{running && <span className="ml-0.5 animate-pulse">▍</span>}</p>
              ) : (
                <p className="text-muted-foreground">Response akan muncul di sini — synthetic stream, ~1s.</p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Demo data — wire real provider di `convex/features/ai/run.ts` + key vault adapter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
