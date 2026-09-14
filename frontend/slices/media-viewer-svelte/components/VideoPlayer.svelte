<script lang="ts">
  import { onMount } from "svelte";
  import type { Sample } from "../../media-viewer/lib/samples";
  import Transport from "./Transport.svelte";

  let { file } = $props<{ file: Sample }>();
  let playing = $state(false);
  let pos = $state(0);
  let duration = $derived(file.duration ?? 24);

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

<div class="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl shadow-2xl">
  <div class="relative aspect-video bg-[linear-gradient(135deg,#2a2f6b,#ff7ac4)]">
    <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0_14px,transparent_14px_28px)]"></div>
    <div class="absolute bottom-3 left-4 font-mono text-xs text-white/85">▣ {file.name}</div>
    <div class="absolute inset-0 grid place-items-center">
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        title={playing ? "Pause" : "Play"}
        onclick={() => (playing = !playing)}
        class="grid size-16 place-items-center rounded-full bg-background/40 text-2xl text-foreground backdrop-blur hover:bg-background/60"
      >
        {playing ? "Ⅱ" : "▶"}
      </button>
    </div>
  </div>
  <div class="bg-background/80 px-3 py-2 text-foreground backdrop-blur">
    <Transport
      {playing}
      {pos}
      {duration}
      onToggle={() => (playing = !playing)}
      onSeek={seek}
      trailing="🔊"
    />
  </div>
</div>
