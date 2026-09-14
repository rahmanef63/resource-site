<script lang="ts">
  import { fmtTime } from "../../media-viewer/lib/media";

  let {
    playing,
    pos,
    duration,
    onToggle,
    onSeek,
    trailing = "",
  } = $props<{
    playing: boolean;
    pos: number;
    duration: number;
    onToggle: () => void;
    onSeek: (pos: number) => void;
    trailing?: string;
  }>();

  function seek(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    onSeek(Number(input.value) / 1000);
  }
</script>

<div class="flex items-center gap-3">
  <button
    type="button"
    aria-label={playing ? "Pause" : "Play"}
    title={playing ? "Pause" : "Play"}
    onclick={onToggle}
    class="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20"
  >
    {playing ? "Ⅱ" : "▶"}
  </button>
  <span class="font-mono text-xs tabular-nums">{fmtTime(pos * duration)}</span>
  <input
    type="range"
    min="0"
    max="1000"
    value={Math.round(pos * 1000)}
    oninput={seek}
    aria-label="Seek"
    class="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
  />
  <span class="font-mono text-xs tabular-nums text-muted-foreground">{fmtTime(duration)}</span>
  {#if trailing}<span class="shrink-0 text-muted-foreground" aria-hidden="true">{trailing}</span>{/if}
</div>
