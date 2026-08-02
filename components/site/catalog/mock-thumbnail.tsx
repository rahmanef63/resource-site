// Synthetic CSS-only thumbnails for items without a renderable preview
// (slices, recipes, marketing layouts that don't ship full pages).
//
// 5 variants:
//   - "marketing"  : hero + 3-col strip mock
//   - "dashboard"  : sidebar + topbar + grid mock
//   - "cms"        : list + edit pane mock
//   - "slice"      : gradient + category icon centered + accent dots
//   - "recipe"     : gradient + recipe icon centered + code-line accent
//
// Color is derived from a category string so each domain has its own hue.

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CmsMock,
  DashboardMock,
  MarketingMock,
  RecipeMock,
  SliceMock,
} from "./mock-variants";

type MockKind = "marketing" | "dashboard" | "cms" | "slice" | "recipe";

const CATEGORY_HUE: Record<string, string> = {
  // Layout categories
  marketing: "from-rose-500/20 via-orange-500/10 to-amber-500/10",
  dashboard: "from-blue-500/20 via-indigo-500/10 to-purple-500/10",
  cms: "from-emerald-500/20 via-teal-500/10 to-cyan-500/10",
  // Slice categories
  ai: "from-violet-500/25 via-fuchsia-500/10 to-rose-500/10",
  auth: "from-amber-500/25 via-yellow-500/10 to-orange-500/10",
  payment: "from-emerald-500/25 via-green-500/10 to-lime-500/10",
  email: "from-sky-500/25 via-blue-500/10 to-indigo-500/10",
  data: "from-orange-500/25 via-amber-500/10 to-yellow-500/10",
  search: "from-cyan-500/25 via-teal-500/10 to-emerald-500/10",
  realtime: "from-purple-500/25 via-fuchsia-500/10 to-pink-500/10",
  content: "from-stone-500/25 via-zinc-500/10 to-neutral-500/10",
  storage: "from-slate-500/25 via-gray-500/10 to-zinc-500/10",
  ui: "from-pink-500/25 via-rose-500/10 to-red-500/10",
  infra: "from-zinc-500/25 via-slate-500/10 to-gray-500/10",
  // Fallback
  default: "from-muted/40 via-muted/20 to-muted/40",
};

function hueFor(category?: string): string {
  return CATEGORY_HUE[category ?? "default"] ?? CATEGORY_HUE.default;
}

export function MockThumbnail({
  kind,
  category,
  icon,
  label,
  accents,
  className,
}: {
  kind: MockKind;
  category?: string;
  icon?: LucideIcon;
  label?: string;
  /** Small text chips overlaid on the thumb (e.g., provider names, tech). */
  accents?: string[];
  className?: string;
}) {
  const Icon = icon ?? Layers;
  const hue = hueFor(category);

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden rounded-md ring-1 ring-border/40",
        "bg-gradient-to-br",
        hue,
        className,
      )}
    >
      {kind === "marketing" && <MarketingMock />}
      {kind === "dashboard" && <DashboardMock />}
      {kind === "cms" && <CmsMock />}
      {kind === "slice" && <SliceMock Icon={Icon} label={label} accents={accents} />}
      {kind === "recipe" && <RecipeMock Icon={Icon} label={label} />}
    </div>
  );
}
