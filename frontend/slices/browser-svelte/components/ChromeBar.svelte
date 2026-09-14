<script lang="ts">
  import { hostOf, isSecure } from "../../browser/lib/url";
  import type { Bookmark } from "../../browser/lib/storage-core";
  import type { BrowserTab } from "../../browser/lib/session-core";

  type Props = {
    tabs: BrowserTab[];
    activeId: number;
    url: string;
    busy: boolean;
    bookmarked: boolean;
    bookmarks: Bookmark[];
    aiOpen: boolean;
    onSwitch: (id: number) => void;
    onClose: (id: number) => void;
    onNew: () => void;
    onSubmit: (value: string) => void;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
    onHome: () => void;
    onToggleBookmark: () => void;
    onHistory: () => void;
    onToggleAi: () => void;
  };

  let {
    tabs,
    activeId,
    url,
    busy,
    bookmarked,
    bookmarks,
    aiOpen,
    onSwitch,
    onClose,
    onNew,
    onSubmit,
    onBack,
    onForward,
    onReload,
    onHome,
    onToggleBookmark,
    onHistory,
    onToggleAi,
  }: Props = $props();
  let draft = $state("");
  let mirror = $derived(url || "");
  let editing = $state(false);
  let display = $derived(editing ? draft : mirror);

  function submit() {
    const value = display.trim();
    if (!value) return;
    editing = false;
    onSubmit(value);
  }
</script>

<div class="border-b border-border bg-card">
  <div class="flex min-w-0 items-end gap-1 overflow-x-auto px-1.5 pt-1.5">
    {#each tabs as tab (tab.id)}
      <button
        role="tab"
        aria-selected={tab.id === activeId}
        class="group flex min-w-[104px] max-w-[180px] shrink-0 items-center gap-1 rounded-t-md px-2.5 py-1.5 text-xs {tab.id === activeId ? 'bg-background font-medium' : 'text-muted-foreground hover:bg-accent/60'}"
        onclick={() => onSwitch(tab.id)}
      >
        <span class="min-w-0 flex-1 truncate text-left">{tab.title || hostOf(tab.url) || "New Tab"}</span>
        <span
          role="button"
          tabindex="0"
          aria-label="Close tab"
          class="grid size-5 place-items-center rounded hover:bg-secondary"
          onclick={(event) => { event.stopPropagation(); onClose(tab.id); }}
          onkeydown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onClose(tab.id); } }}
        >×</span>
      </button>
    {/each}
    <button class="mb-1 size-7 shrink-0 rounded-md text-muted-foreground hover:bg-secondary" aria-label="New tab" onclick={onNew}>+</button>
    <button class="mb-1 ml-auto shrink-0 rounded-md px-2 py-1 text-xs {aiOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}" onclick={onToggleAi}>✦ AI</button>
  </div>

  <div class="flex items-center gap-1 px-2 py-1.5">
    <button class="size-7 rounded-md text-xs hover:bg-secondary" aria-label="Back" onclick={onBack}>←</button>
    <button class="hidden size-7 rounded-md text-xs hover:bg-secondary sm:block" aria-label="Forward" onclick={onForward}>→</button>
    <button class="size-7 rounded-md text-xs hover:bg-secondary" aria-label="Reload" onclick={onReload}>{busy ? "×" : "↻"}</button>
    <button class="hidden size-7 rounded-md text-xs hover:bg-secondary sm:block" aria-label="Home" onclick={onHome}>⌂</button>
    <form class="relative min-w-0 flex-1" onsubmit={(event) => { event.preventDefault(); submit(); }}>
      <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] {isSecure(url) ? 'text-emerald-500' : 'text-muted-foreground'}">{url ? (isSecure(url) ? "▣" : "◎") : "⌕"}</span>
      <input
        aria-label="Address and search bar"
        class="h-8 w-full rounded-full border border-input bg-background px-8 pr-10 text-xs"
        value={display}
        placeholder="Search Google or type a URL"
        onfocus={() => { editing = true; draft = mirror; }}
        oninput={(event) => { editing = true; draft = event.currentTarget.value; }}
        onkeydown={(event) => { if (event.key === "Escape") { editing = false; draft = mirror; event.currentTarget.blur(); } }}
      />
      <button type="button" class="absolute right-1 top-1/2 size-6 -translate-y-1/2 rounded-full text-xs hover:bg-secondary" aria-label="Toggle bookmark" disabled={!url} onclick={onToggleBookmark}>{bookmarked ? "★" : "☆"}</button>
    </form>
    <button class="size-7 rounded-md text-xs hover:bg-secondary" aria-label="History" onclick={onHistory}>◷</button>
  </div>

  {#if bookmarks.length > 0}
    <div class="flex gap-1 overflow-x-auto border-t border-border/60 px-2 py-1">
      {#each bookmarks as bookmark (bookmark.url)}
        <button class="whitespace-nowrap rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground" onclick={() => onSubmit(bookmark.url)}>◎ {bookmark.title}</button>
      {/each}
    </div>
  {/if}
</div>
