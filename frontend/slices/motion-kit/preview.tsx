"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { Reveal } from "./motion/reveal";
import { CountUp } from "./motion/count-up";

const preview: SlicePreviewModule = {
  Reveal: ({ variant }) => (
    <div className="space-y-6 p-6">
      <Reveal variant={(variant.variant as "fade-up" | "zoom") ?? "fade-up"}>
        <div className="rounded-xl border border-border/60 bg-card/50 p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Reveal</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            <CountUp value={4800} />+ <span className="text-base font-normal text-muted-foreground">orders</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Scrolls into view → fades/zooms in. Append globals-motion.css for the live transition.
          </p>
        </div>
      </Reveal>
    </div>
  ),
};
export default preview;
