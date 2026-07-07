"use client";
// glass-desktop — audio-eq (media, SP). Ported from Lucent v4 "eq" pill. Reads
// the shared media state (STORAGE.media) so the EqBars pulse in lock-step with
// now-playing's play/pause, over a small label. Read-only mirror of the state.
import { EqBars } from "@/features/glass-desktop/components/charts";
import { STORAGE } from "@/features/glass-desktop/config/constants";
import { usePersistentState } from "@/features/glass-desktop/hooks/use-persistent-state";
import { mediaSeed, type MediaState } from "@/features/glass-desktop/lib/seeds/media.seed";
import { audioEq } from "@/features/glass-desktop/lib/seeds/media.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

export function AudioEq(_props: WidgetProps) {
  const [media] = usePersistentState<MediaState>(STORAGE.media, mediaSeed);

  return (
    <div className="flex h-full items-center gap-2.5">
      <EqBars playing={media.playing} bars={audioEq.bars} color={media.accent} height={24} />
      <span className="min-w-0 truncate text-xs font-medium" style={{ color: "var(--color-ink-mid)" }}>
        {audioEq.label}
      </span>
    </div>
  );
}
