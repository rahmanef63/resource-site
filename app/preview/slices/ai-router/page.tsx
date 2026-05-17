"use client";

import * as React from "react";
import { Bot, Cpu, Brain, Zap, Send } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock, FlowDiagram } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tier = "nano" | "mid" | "flagship";

const PRESETS: { tier: Tier; model: string; latency: string; cost: string; icon: React.ComponentType<{ className?: string }>; use: string }[] = [
  { tier: "nano",     model: "claude-haiku-4-5",   latency: "~0.4s", cost: "$0.0008/1k", icon: Zap,   use: "spam-flag, headline-suggest, intent classify" },
  { tier: "mid",      model: "claude-sonnet-4-6",  latency: "~1.2s", cost: "$0.003/1k",  icon: Cpu,   use: "chat, draft, summary, RAG-Q&A" },
  { tier: "flagship", model: "claude-opus-4-7",    latency: "~3.0s", cost: "$0.015/1k",  icon: Brain, use: "methodology review, multi-step reasoning" },
];

export default function Page() {
  const [tier, setTier] = React.useState<Tier>("mid");
  const [prompt, setPrompt] = React.useState("Ringkas konten ini dalam 3 poin.");
  const [thinking, setThinking] = React.useState(false);

  async function go() {
    setThinking(true);
    setTimeout(() => setThinking(false), 1200);
  }

  return (
    <SlicePreviewLayout
      title="AI Router (OpenRouter)"
      kind="backend"
      description="Tier-routed LLM access. Pick nano / mid / flagship per workload; one usage table for cost tracking."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/ai-router"
    >
      <PreviewSection title="3 tiers" hint="Pick per workload, not per app">
        <div className="grid gap-3 md:grid-cols-3">
          {PRESETS.map((p) => (
            <Button
              key={p.tier}
              variant="outline"
              onClick={() => setTier(p.tier)}
              className={cn(
                "h-auto flex-col items-start gap-0 whitespace-normal rounded-lg p-4 text-left",
                tier === p.tier ? "border-foreground bg-accent/40" : "hover:bg-accent/20",
              )}
            >
              <div className="flex items-center gap-2">
                <p.icon className="h-4 w-4" />
                <span className="text-sm font-semibold capitalize">{p.tier}</span>
              </div>
              <div className="mt-2 font-mono text-[10px] text-muted-foreground">{p.model}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[9px]">{p.latency}</Badge>
                <Badge variant="outline" className="text-[9px]">{p.cost}</Badge>
              </div>
              <p className="mt-2 text-[11px] font-normal text-muted-foreground">{p.use}</p>
            </Button>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Test prompt" hint="Mock — actual call goes to OpenRouter">
        <Card className="space-y-3 p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none"
          />
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-[10px]">
              tier: {tier}
            </Badge>
            <Button
              size="sm"
              onClick={go}
              disabled={thinking}
              className="h-auto gap-1.5 rounded-md px-3 py-1.5 text-xs"
            >
              <Send className="h-3 w-3" />
              {thinking ? "Memproses…" : "Send"}
            </Button>
          </div>
          {thinking ? (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <Bot className="mr-1 inline h-3.5 w-3.5" /> {PRESETS.find((p) => p.tier === tier)?.model} sedang berpikir…
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-3 text-xs">
              <Bot className="mr-1 inline h-3.5 w-3.5" /> <span className="font-medium">Output preview</span>
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
                <li>Poin pertama dari konten…</li>
                <li>Poin kedua dengan detail penting…</li>
                <li>Poin ketiga sebagai kesimpulan…</li>
              </ul>
            </div>
          )}
        </Card>
      </PreviewSection>

      <PreviewSection title="Flow">
        <FlowDiagram
          steps={[
            { title: "Convex action call", detail: "api.ai.complete({ tier, messages })" },
            { title: "Tier resolver", detail: "tier → openrouter model id" },
            { title: "OpenRouter call", detail: "POST chat/completions, stream tokens" },
            { title: "Persist usage", detail: "ai_usage row — tokens × price" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// convex/features/ai/router.ts
import { action } from "../../_generated/server";
import { v } from "convex/values";

export const complete = action({
  args: { tier: v.union(v.literal("nano"), v.literal("mid"), v.literal("flagship")), messages: v.array(v.any()) },
  handler: async (ctx, { tier, messages }) => {
    const model = { nano: "claude-haiku-4-5", mid: "claude-sonnet-4-6", flagship: "claude-opus-4-7" }[tier];
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: \`Bearer \${process.env.OPENROUTER_API_KEY}\`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages }),
    });
    return res.json();
  },
});`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
