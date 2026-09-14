<script lang="ts">
  import { VIEW_H, VIEW_W } from "../../browser/lib/session-core";

  type Props = {
    shot: string | null;
    busy: boolean;
    live: boolean;
    saving: boolean;
    savedPath: string | null;
    onClick: (x: number, y: number) => void;
    onType: (text: string) => void;
    onKey: (key: string) => void;
    onScroll: (dy: number) => void;
    onSave: () => void;
  };
  let { shot, busy, live, saving, savedPath, onClick, onType, onKey, onScroll, onSave }: Props = $props();
  let surface = $state<HTMLButtonElement>();
  let wheelAt = 0;
  const namedKeys = new Set(["Enter", "Backspace", "Tab", "Delete", "Escape"]);

  function click(event: MouseEvent) {
    if (!surface || !shot) return;
    const rect = surface.getBoundingClientRect();
    onClick(Math.round((event.clientX - rect.left) * (VIEW_W / rect.width)), Math.round((event.clientY - rect.top) * (VIEW_H / rect.height)));
  }
  function keydown(event: KeyboardEvent) {
    const key = event.key;
    if (key.length === 1) onType(key);
    else if (namedKeys.has(key) || key.startsWith("Arrow")) onKey(key);
    else return;
    event.preventDefault();
  }
  function wheel(event: WheelEvent) {
    const now = Date.now();
    if (now - wheelAt < 220) return;
    wheelAt = now;
    onScroll(event.deltaY);
  }
</script>

<div class="relative size-full overflow-hidden bg-background">
  <button
    bind:this={surface}
    type="button"
    aria-label="Remote browser viewport"
    class="absolute inset-0 size-full border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    onclick={click}
    onkeydown={keydown}
    onwheel={wheel}
  >
    {#if shot}
      <img src={shot} alt="Remote browser viewport" draggable="false" class="pointer-events-none size-full object-contain select-none" />
    {:else}
      <span class="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading remote browser…</span>
    {/if}
  </button>
  <div class="pointer-events-none absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur">
    <span class="mr-1 inline-block size-2 rounded-full {live ? 'bg-emerald-500' : 'bg-amber-500'}"></span>{live ? "live" : "polling"}
  </div>
  {#if busy}<div class="pointer-events-none absolute right-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm">loading…</div>{/if}
  <div class="absolute bottom-2 right-2 flex max-w-[calc(100%-1rem)] items-center gap-2">
    {#if savedPath}<span class="hidden max-w-80 truncate rounded-full bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow-sm sm:block">✓ Saved {savedPath}</span>{/if}
    <button class="rounded-full bg-card/90 px-2.5 py-1 text-[11px] shadow-sm disabled:opacity-50" disabled={!shot || saving} onclick={onSave}>{saving ? "saving…" : "▧ save shot"}</button>
  </div>
</div>
