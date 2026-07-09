"use client";
// glass-desktop — reaction-tray (media, W). Ported from Lucent v4. A 4×2 grid of
// eight lucide reaction glyphs as shadcn Buttons; a click bumps that reaction's
// tally and replays a 160ms pop (motion-safe only). Tallies are local UI state.
// Content only — the canvas supplies the glass shell.
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Heart, Star, ThumbsUp, Zap, Flame, Sparkles, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  reactionTray,
  type ReactionKey,
} from "@/features/glass-desktop/lib/seeds/media-2.seed";
import { compact } from "@/features/glass-desktop/utils/format";
import { cn } from "@/lib/utils";
import type { WidgetProps } from "@/features/glass-desktop/types";

const ICONS: Record<ReactionKey, LucideIcon> = {
  heart: Heart,
  star: Star,
  "thumbs-up": ThumbsUp,
  zap: Zap,
  flame: Flame,
  sparkles: Sparkles,
  check: Check,
  plus: Plus,
};

// A nonce keyed per glyph remounts the icon on each click so the pop replays;
// the animation only runs where motion is allowed.
const POP = `@media (prefers-reduced-motion: no-preference){
  .rr-reaction-pop{animation:rr-reaction-pop 160ms var(--ease-settle, ease-out);}
}
@keyframes rr-reaction-pop{0%{transform:scale(1);}45%{transform:scale(1.35);}100%{transform:scale(1);}}`;

interface Tally {
  count: number;
  nonce: number;
}

export function ReactionTray(_props: WidgetProps) {
  const [tallies, setTallies] = useState<Record<string, Tally>>(() =>
    Object.fromEntries(reactionTray.map((r) => [r.key, { count: r.count, nonce: 0 }])),
  );

  const bump = (key: ReactionKey) =>
    setTallies((prev) => {
      const t = prev[key] ?? { count: 0, nonce: 0 };
      return { ...prev, [key]: { count: t.count + 1, nonce: t.nonce + 1 } };
    });

  return (
    <div className="grid h-full w-full grid-cols-4 grid-rows-2 gap-1.5">
      <style>{POP}</style>
      {reactionTray.map((r) => {
        const Icon = ICONS[r.key];
        const t = tallies[r.key] ?? { count: r.count, nonce: 0 };
        return (
          <Button
            key={r.key}
            type="button"
            variant="ghost"
            aria-label={`${r.label} — ${t.count}`}
            onClick={() => bump(r.key)}
            className={cn(
              "flex h-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] p-0",
              "[background:var(--color-glass-lo)] hover:[background:var(--color-glass-hi)]",
            )}
          >
            <span
              key={t.nonce}
              className={cn("inline-flex", t.nonce > 0 && "rr-reaction-pop")}
              style={{ color: r.accent }}
            >
              <Icon aria-hidden className="size-4" />
            </span>
            <span
              className="text-[10px] tabular-nums"
              style={{ fontFamily: "var(--font-numeric)", color: "var(--color-ink-mid)" }}
            >
              {compact(t.count)}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
