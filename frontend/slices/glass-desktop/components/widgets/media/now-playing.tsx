"use client";
// glass-desktop — now-playing (media, WP). Ported from Lucent v4 "now playing"
// pill: album swatch, track/artist, a progress bar, and a play/pause toggle.
// State persists under STORAGE.media; while playing, the shared clock advances
// the position one second per tick (wrapping at the track duration).
import { useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { duration } from "@/features/glass-desktop/utils/format";
import { mediaSeed, type MediaState } from "@/features/glass-desktop/lib/seeds/media.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const NUM = { fontFamily: "var(--font-numeric)" } as const;

export function NowPlaying(_props: WidgetProps) {
  const [media, setMedia] = usePersistentState<MediaState>(STORAGE.media, mediaSeed);
  const now = useClock("second");
  const lastTick = useRef(0);

  // Advance position once per real second while playing (skip the first tick so
  // mounting doesn't jump the counter).
  useEffect(() => {
    const t = Math.floor(now.getTime() / 1000);
    if (lastTick.current === 0 || t === lastTick.current) {
      lastTick.current = t;
      return;
    }
    lastTick.current = t;
    if (!media.playing) return;
    setMedia((m) => ({ ...m, positionSec: (m.positionSec + 1) % m.durationSec }));
  }, [now, media.playing, setMedia]);

  const pct = Math.min(100, (media.positionSec / media.durationSec) * 100);

  return (
    <div className="flex h-full items-center gap-3">
      <div
        aria-hidden
        className="size-11 shrink-0 rounded-[10px]"
        style={{ background: `linear-gradient(135deg, ${media.accent}, var(--color-glass-lo))` }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium" style={{ color: "var(--color-ink-hi)" }}>
            {media.title}
          </div>
          <div className="truncate text-xs" style={{ color: "var(--color-ink-mid)" }}>
            {media.artist}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1 flex-1 overflow-hidden rounded-full"
            style={{ background: "var(--color-hairline)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: media.accent }}
            />
          </div>
          <span className="text-[10px]" style={{ ...NUM, color: "var(--color-ink-low)" }}>
            {duration(media.positionSec)}
          </span>
        </div>
      </div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={media.playing ? `Pause ${media.title}` : `Play ${media.title}`}
        className="size-9 shrink-0 rounded-full [background:var(--color-glass-solid)]"
        onClick={() => setMedia((m) => ({ ...m, playing: !m.playing }))}
      >
        {media.playing ? (
          <Pause aria-hidden style={{ color: "var(--color-ink-hi)" }} />
        ) : (
          <Play aria-hidden style={{ color: "var(--color-ink-hi)" }} />
        )}
      </Button>
    </div>
  );
}
