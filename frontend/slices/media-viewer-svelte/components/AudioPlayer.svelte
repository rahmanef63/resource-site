<script lang="ts">
  import { onMount } from "svelte";
  import type { Sample } from "../../media-viewer/lib/samples";
  import Transport from "./Transport.svelte";

  const BARS = 72;
  const heights = Array.from({ length: BARS }, (_, index) => {
    const value = Math.abs(Math.sin(index * 0.5) * Math.cos(index * 0.23));
    return 0.15 + value * 0.85;
  });

  let { file } = $props<{ file: Sample }>();
  let playing = $state(false);
  let pos = $state(0);
  let duration = $derived(file.duration ?? 42);

  onMount(() => {
    const timer = setInterval(() => {
      if (!playing) return;
      const next = Math.min(1, pos + 0.1 / Math.max(duration, 0.1));
      pos = next;
      if (next >= 1) playing = false;
    }, 100);
    return () => clearInterval(timer);
  });

  function seek(next: number) {
    pos = Math.max(0, Math.min(1, next));
  }
</script>

<div class="flex w-full max-w-lg flex-col gap-5 rounded-2xl border bg-card/80 p-6 shadow-2xl backdrop-blur">
  <div class="flex items-center gap-4">
    <div class="grid size-14 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/15 text-2xl text-[var(--accent)]">♫</div>
    <div class="min-w-0">
      <div class="truncate text-base font-semibold">{file.name}</div>
      <div class="text-xs text-muted-foreground">{file.meta ?? "Audio"}</div>
    </div>
  </div>

  <div class="flex h-14 items-center gap-[2px]" aria-label="Waveform">
    {#each heights as height, index}
      <div
        class={`flex-1 rounded-full transition-colors ${index / BARS <= pos ? "bg-[var(--accent)]" : "bg-border"}`}
        style:height={`${Math.round(height * 100)}%`}
      ></div>
    {/each}
  </div>

  <Transport {playing} {pos} {duration} onToggle={() => (playing = !playing)} onSeek={seek} />
</div>
