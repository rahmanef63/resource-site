<script lang="ts">
  let { pct, done, url, onClose } = $props<{ pct: number; done: boolean; url?: string; onClose: () => void }>();
</script>
<div class="absolute inset-0 z-50 grid place-items-center bg-black/70 p-4">
  <div class="w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl">
    <div class="flex items-center justify-between gap-3"><strong class="text-sm">{done ? "Render complete" : "Rendering video"}</strong><button class="rounded border px-2 py-1 text-xs" onclick={onClose}>{done ? "Close" : "Cancel"}</button></div>
    <div class="mt-4 h-2 overflow-hidden rounded bg-muted"><div class="h-full bg-primary transition-all" style={`width:${Math.max(0, Math.min(100, pct))}%`}></div></div>
    <p class="mt-2 text-xs text-muted-foreground">{Math.round(pct)}%</p>
    {#if done && url}<a class="mt-4 inline-block rounded bg-primary px-3 py-2 text-xs text-primary-foreground" href={url} download="reel.webm">Download WebM</a>{/if}
  </div>
</div>
