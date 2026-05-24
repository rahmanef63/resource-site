import {
  Check,
  Plug,
  ShieldCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURE_CATEGORIES, type FeatureCategory } from "./features-data";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Workflow,
  ShieldCheck,
  Plug,
};

const PLAN_TONE: Record<string, "default" | "outline" | "secondary"> = {
  Free:  "outline",
  Team:  "default",
  Scale: "secondary",
};

function CategoryBlock({ cat }: { cat: FeatureCategory }) {
  const Icon = ICON_MAP[cat.icon] ?? Zap;
  return (
    <div className="mt-12 first:mt-0">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500/25 to-indigo-500/25">
            <Icon className="size-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{cat.label}</h2>
            <p className="text-sm text-muted-foreground">{cat.blurb}</p>
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {cat.items.length} features
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cat.items.map((it) => (
          <Card key={it.title} className="border-border/60 bg-card/40">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Check className="size-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{it.title}</p>
                  {it.availableFrom && (
                    <Badge
                      variant={PLAN_TONE[it.availableFrom] ?? "outline"}
                      className="rounded-full text-[10px]"
                    >
                      {it.availableFrom}+
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{it.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** CK-2B — full feature matrix grouped by category. Renders all four
 *  FEATURE_CATEGORIES with plan-availability badges and a per-row check
 *  icon. Designed to occupy the full width below the FeatureGridClient. */
export function FeatureMatrix() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Full matrix
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything in the product, sliced by job
          </h2>
          <p className="mt-3 text-muted-foreground">
            Free covers most teams. Team unlocks workflow + SSO. Scale adds residency
            + signed agreements.
          </p>
        </div>
        {FEATURE_CATEGORIES.map((cat) => (
          <CategoryBlock key={cat.id} cat={cat} />
        ))}
      </div>
    </section>
  );
}
