"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useShellAppearance } from "../registry/capabilities";

/** One paintable backdrop: a `.wp-*` preset class or the host's custom
 *  image/gradient style. `key` identifies the visual — a key change is what
 *  triggers the crossfade (background-image never interpolates in CSS, so a
 *  wallpaper switch fades whole layers instead of transitioning `background`). */
type Layer = { key: string; className?: string; style?: CSSProperties };

function LayerDiv({ layer, fade, onDone }: { layer: Layer; fade?: boolean; onDone?: () => void }) {
  return (
    <div
      style={layer.style}
      onAnimationEnd={onDone ? (e) => e.target === e.currentTarget && onDone() : undefined}
      className={cn(
        "absolute inset-0 bg-cover bg-center",
        layer.className,
        // Rides the shared `enter` keyframe (globals.css), so the reduce-motion
        // kill-switch zeroes the duration automatically — and a 0s animation
        // still fires animationend, so the prev-layer cleanup always runs.
        fade && "animate-in fade-in-0 [--tw-duration:700ms]",
      )}
    />
  );
}

export function Wallpaper({ shellDefault }: { shellDefault?: string }) {
  const { wallpaper, wallpaperStyle } = useShellAppearance();
  // Custom image/gradient (from the host's image-picker) wins over the preset;
  // "auto" (or no choice) follows the active shell's native backdrop.
  const preset = !wallpaper || wallpaper === "auto" ? (shellDefault ?? "aurora") : wallpaper;
  const next: Layer = wallpaperStyle
    ? { key: `custom:${JSON.stringify(wallpaperStyle)}`, style: wallpaperStyle }
    : { key: preset, className: `wp-${preset}` };

  // Crossfade bookkeeping: on a wallpaper change the outgoing layer stays
  // mounted underneath while the new one fades in on top (remounted via key).
  // Render-time state adjustment so the swap + fade start in the same commit.
  const [last, setLast] = useState(next);
  const [prev, setPrev] = useState<Layer | null>(null);
  if (last.key !== next.key) {
    setPrev(last);
    setLast(next);
  }

  return (
    <div aria-hidden className="absolute inset-0 z-0">
      {prev && <LayerDiv layer={prev} />}
      <LayerDiv key={next.key} layer={next} fade={!!prev} onDone={() => setPrev(null)} />
    </div>
  );
}
