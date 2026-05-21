"use client";

import * as React from "react";
import { Bot, RotateCcw, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CONFIG,
  DEFAULT_MODERATION,
  MODELS,
  PROVIDERS,
  TIER_META,
} from "./seed";
import { ProviderCard } from "./provider-card";
import { ModerationRowItem } from "./moderation-row";
import { Knob, Stat } from "./knobs";
import type { AiConfig, ModerationRule, ProviderId } from "./types";

/** Real admin-panel "AI Config" block — third BS-pattern impl
 *  (after users + audit-log). Pure client demo: provider grid + active
 *  model picker grouped by provider + system prompt editor + sampling
 *  knobs + moderation rule list with per-rule threshold sliders. No
 *  persistence. Real impl backed by the ai-router slice (today still
 *  barrel-only, to be filled in a future wave). */
export function AiConfigBlockView() {
  const [config, setConfig] = React.useState<AiConfig>(DEFAULT_CONFIG);
  const [moderation, setModeration] =
    React.useState<ModerationRule[]>(DEFAULT_MODERATION);
  const activeModel = MODELS.find((m) => m.id === config.activeModelId)!;
  const activeProvider = PROVIDERS.find((p) => p.id === activeModel.provider)!;
  const enabledRules = moderation.filter((r) => r.enabled).length;

  function toggleRule(id: string, enabled: boolean) {
    setModeration((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
  }
  function setThreshold(id: string, threshold: number) {
    setModeration((prev) => prev.map((r) => (r.id === id ? { ...r, threshold } : r)));
  }
  function reset() {
    setConfig(DEFAULT_CONFIG);
    setModeration(DEFAULT_MODERATION);
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">AI configuration</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {PROVIDERS.length} providers · {MODELS.length} models · {enabledRules} of{" "}
            {moderation.length} moderation rules enabled
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button size="sm" className="gap-1.5">
            <Save className="size-3.5" />
            Save changes
          </Button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {PROVIDERS.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            modelCount={MODELS.filter((m) => m.provider === p.id).length}
          />
        ))}
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Active model</h2>
          <Badge variant="outline" className={"ml-auto text-[10px] uppercase " + TIER_META[activeModel.tier].tone}>
            {TIER_META[activeModel.tier].label}
          </Badge>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
          <Select
            value={config.activeModelId}
            onValueChange={(id) => setConfig((c) => ({ ...c, activeModelId: id }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["anthropic", "openai", "mistral", "google"] as ProviderId[]).map((pid) => (
                <SelectGroup key={pid}>
                  <SelectLabel className="text-[10px] uppercase">
                    {PROVIDERS.find((p) => p.id === pid)?.label}
                  </SelectLabel>
                  {MODELS.filter((m) => m.provider === pid).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}{" "}
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        · {m.contextWindowK}K · ${m.inputCostUSD}/${m.outputCostUSD} per 1M
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Context" value={`${activeModel.contextWindowK}K`} />
            <Stat label="Input $/1M" value={`$${activeModel.inputCostUSD}`} />
            <Stat label="Output $/1M" value={`$${activeModel.outputCostUSD}`} />
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Routed via <code className="rounded bg-muted px-1 py-0.5">{activeProvider.label}</code>{" "}
          adapter. Fallback chain: Sonnet → Haiku → GPT-4o mini.
        </p>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Bot className="size-3.5 text-muted-foreground" />
          <h2 className="text-sm font-semibold">System prompt & sampling</h2>
          <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground">
            {config.systemPrompt.length} / 4000
          </span>
        </div>
        <Textarea
          value={config.systemPrompt}
          onChange={(e) => setConfig((c) => ({ ...c, systemPrompt: e.target.value }))}
          rows={4}
          className="mt-3 font-mono text-xs"
          maxLength={4000}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Knob
            label="Temperature"
            value={config.temperature}
            min={0}
            max={1}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={(v) => setConfig((c) => ({ ...c, temperature: v }))}
          />
          <Knob
            label="Max output tokens"
            value={config.maxOutputTokens}
            min={256}
            max={8192}
            step={256}
            format={(v) => v.toString()}
            onChange={(v) => setConfig((c) => ({ ...c, maxOutputTokens: v }))}
          />
        </div>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-sm font-semibold">Moderation rules</h2>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {enabledRules} / {moderation.length} active
          </span>
        </div>
        <div className="divide-y">
          {moderation.map((r) => (
            <ModerationRowItem
              key={r.id}
              rule={r}
              onToggle={(next) => toggleRule(r.id, next)}
              onThreshold={(next) => setThreshold(r.id, next)}
            />
          ))}
        </div>
      </section>

      <p className="text-[10px] text-muted-foreground">
        Demo data — resets on browser reload. Real impl backed by{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">ai-router</code> slice (provider
        adapters + key vault) + Convex schema for persisted config.
      </p>
    </div>
  );
}

