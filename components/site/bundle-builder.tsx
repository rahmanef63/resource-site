"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, ExternalLink, Layers, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/site/code-block";
import { getTemplateConfig } from "@/lib/templates/configs";
import type { ConfigField, Selections } from "@/components/site/feature-context";

type Item = {
  slug: string;
  title: string;
  description: string;
  kind: "layout" | "recipe";
};

function defaultsFor(slug: string): Selections {
  const cfg = getTemplateConfig(slug);
  if (!cfg) return {};
  const out: Selections = {};
  for (const g of cfg.config.groups) {
    for (const f of g.fields) {
      if (f.type === "radio" || f.type === "select") out[f.id] = f.default;
      else if (f.type === "check") out[f.id] = f.default ?? false;
      else if (f.type === "multi") out[f.id] = f.default ?? [];
    }
  }
  return out;
}

export function BundleBuilder({ items }: { items: Item[] }) {
  const [included, setIncluded] = React.useState<Record<string, boolean>>({});
  const [selectionsBySlug, setSelectionsBySlug] = React.useState<Record<string, Selections>>(() => {
    const init: Record<string, Selections> = {};
    for (const it of items) init[it.slug] = defaultsFor(it.slug);
    return init;
  });
  const [openConfig, setOpenConfig] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const includedItems = items.filter((i) => included[i.slug]);
  const composed = composeAllPrompts(includedItems, selectionsBySlug);

  function toggle(slug: string) {
    setIncluded((s) => ({ ...s, [slug]: !s[slug] }));
  }

  function setSelection(slug: string, fieldId: string, value: string | boolean | string[]) {
    setSelectionsBySlug((m) => ({ ...m, [slug]: { ...(m[slug] ?? {}), [fieldId]: value } }));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 sm:p-8">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Catalog · Build</p>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Layers className="size-6" /> Bundle Builder
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pick the templates you want, tweak each per-template, then{" "}
          <span className="text-foreground">copy the composed prompt</span> and feed it to your
          agent. The agent will scaffold every selected template into your project in one go.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Configurable templates ({items.length})
          </h2>

          <div className="space-y-2">
            {items.map((it) => {
              const cfg = getTemplateConfig(it.slug);
              if (!cfg) return null;
              const on = !!included[it.slug];
              const open = openConfig === it.slug;
              return (
                <div key={it.slug} className={cn(
                  "rounded-lg border bg-card transition-colors",
                  on && "border-foreground/40",
                )}>
                  <div className="flex items-start gap-3 p-3">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(it.slug)}
                      className="mt-1 size-4 cursor-pointer accent-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full text-[10px]">{it.kind}</Badge>
                        <Link
                          href={`/${it.kind}s/${it.slug}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {it.title}
                        </Link>
                        <Link
                          href={`/${it.kind}s/${it.slug}`}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Open detail"
                        >
                          <ExternalLink className="size-3" />
                        </Link>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{it.description}</p>
                      {on && (
                        <button
                          onClick={() => setOpenConfig(open ? null : it.slug)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
                          {open ? "Hide config" : "Configure"}
                        </button>
                      )}
                    </div>
                  </div>

                  {on && open && (
                    <div className="space-y-3 border-t bg-muted/30 p-3">
                      {cfg.config.groups.map((g) => (
                        <div key={g.label}>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {g.label}
                          </p>
                          <div className="space-y-2">
                            {g.fields.map((f) => (
                              <FieldInline
                                key={f.id}
                                field={f}
                                value={selectionsBySlug[it.slug]?.[f.id]}
                                onChange={(v) => setSelection(it.slug, f.id, v)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <div className="rounded-lg border bg-card p-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Wand2 className="size-3.5" /> Composed prompt
              <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
                {includedItems.length} included
              </Badge>
            </h3>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(composed);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              size="sm"
              className="mt-2 w-full gap-2"
              disabled={!includedItems.length}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied!" : "Copy composed prompt"}
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Drops one big prompt for the agent to scaffold all selected templates.
            </p>
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <CodeBlock
              code={composed || "# Pick templates from the left to compose a prompt."}
              language="markdown"
              filename="bundle.md"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function FieldInline({
  field, value, onChange,
}: {
  field: ConfigField;
  value: string | boolean | string[] | undefined;
  onChange: (v: string | boolean | string[]) => void;
}) {
  if (field.type === "radio" || field.type === "select") {
    return (
      <label className="flex items-center gap-2">
        <span className="min-w-[110px] text-[11px] text-muted-foreground">{field.label}</span>
        <select
          value={(value as string) ?? field.default}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border bg-background px-2 py-1 text-xs"
        >
          {field.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === "check") {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-xs">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="size-3.5 accent-foreground" />
        <span>{field.label}</span>
      </label>
    );
  }
  if (field.type === "multi") {
    const cur = (value as string[]) ?? field.default ?? [];
    return (
      <div>
        <p className="mb-1 text-[11px] text-muted-foreground">{field.label}</p>
        <div className="flex flex-wrap gap-1">
          {field.options.map((o) => {
            const on = cur.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => onChange(on ? cur.filter((x) => x !== o.id) : [...cur, o.id])}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px]",
                  on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

function composeAllPrompts(items: Item[], sel: Record<string, Selections>): string {
  if (!items.length) return "";
  const blocks: string[] = [
    `# Bundle scaffold (${items.length} templates)`,
    ``,
    `Read each section, run cp commands, apply schema additions, install deps, register nav,`,
    `then run R1..R17 verification (see https://github.com/rahmanef63/resource-site/blob/main/plugins/rresource/SHARED.md).`,
    ``,
    `Source repo: https://github.com/rahmanef63/resource-site`,
    ``,
  ];
  for (const it of items) {
    const cfg = getTemplateConfig(it.slug);
    if (!cfg) continue;
    blocks.push("---");
    blocks.push("");
    blocks.push(cfg.composePrompt(it.slug, it.title, sel[it.slug] ?? {}));
    blocks.push("");
  }
  blocks.push("---");
  blocks.push("");
  blocks.push("## Final verification");
  blocks.push("- `pnpm typecheck && pnpm lint --max-warnings=0 && pnpm test && pnpm build`");
  blocks.push("- All listed templates render at expected routes.");
  blocks.push("- Each template's hard rules from SHARED.md §11 satisfied.");
  return blocks.join("\n");
}
