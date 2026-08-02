"use client";
// glass-desktop — SpacePager (Build Plan §5). Two spaces on one 200%-wide track;
// the active index slides the track by translateX over --duration-settle and is
// instant under prefers-reduced-motion (the transition only runs motion-safe).
// ←/→ arrow keys page between spaces, edge chevrons and dot indicators do the
// same, and the active index persists to STORAGE.space. The two space canvases
// are supplied by the caller (desktop-shell passes <WidgetCanvas space={0|1}/>).
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";

type SpaceIndex = 0 | 1;

export interface SpacePagerProps {
  /** The two space canvases, in order. Index 0 shows first. */
  spaces: readonly [ReactNode, ReactNode];
}

const SPACE_LABELS = ["Today", "System & work"] as const;

export function SpacePager({ spaces }: SpacePagerProps) {
  const [space, setSpace] = usePersistentState<SpaceIndex>(STORAGE.space, 0);

  const go = useCallback(
    (next: SpaceIndex) => setSpace(next),
    [setSpace],
  );

  // ←/→ page between spaces. Ignored while typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 200%-wide track: two 50% panes; translateX slides to the active space. */}
      <div
        className={cn(
          "absolute inset-0 flex",
          "motion-safe:transition-transform",
          "motion-safe:[transition-duration:var(--duration-settle)]",
          "motion-safe:[transition-timing-function:var(--ease-settle)]",
        )}
        style={{ width: "200%", transform: `translateX(${space * -50}%)` }}
      >
        <section
          aria-label={`Space 1 — ${SPACE_LABELS[0]}`}
          aria-hidden={space !== 0}
          className="h-full w-1/2 shrink-0 overflow-auto"
        >
          {spaces[0]}
        </section>
        <section
          aria-label={`Space 2 — ${SPACE_LABELS[1]}`}
          aria-hidden={space !== 1}
          className="h-full w-1/2 shrink-0 overflow-auto"
        >
          {spaces[1]}
        </section>
      </div>

      {/* Edge chevrons — dim on the space they'd leave you on. */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous space"
        onClick={() => go(0)}
        className={cn(
          "absolute top-1/2 left-2 -translate-y-1/2",
          "[color:var(--color-ink-hi)] hover:[background:var(--color-glass-hi)]",
          space === 0 && "opacity-25",
        )}
        style={{ zIndex: 30 }}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next space"
        onClick={() => go(1)}
        className={cn(
          "absolute top-1/2 right-2 -translate-y-1/2",
          "[color:var(--color-ink-hi)] hover:[background:var(--color-glass-hi)]",
          space === 1 && "opacity-25",
        )}
        style={{ zIndex: 30 }}
      >
        <ChevronRight className="size-4" />
      </Button>

      {/* Dot indicators. */}
      <div
        className="absolute right-0 bottom-4 left-0 flex justify-center gap-2"
        style={{ zIndex: 41 }}
      >
        {([0, 1] as const).map((i) => (
          <Button
            key={i}
            variant="ghost"
            size="icon-xs"
            aria-label={`Space ${i + 1}`}
            aria-current={space === i}
            onClick={() => go(i)}
            className="size-3 rounded-full p-0 [&_svg]:hidden"
          >
            <span
              aria-hidden="true"
              className="block size-[7px] rounded-full border"
              style={{
                borderColor: "var(--color-hairline)",
                background: space === i ? "var(--color-ink-hi)" : "var(--color-glass-lo)",
              }}
            />
          </Button>
        ))}
      </div>
    </div>
  );
}
