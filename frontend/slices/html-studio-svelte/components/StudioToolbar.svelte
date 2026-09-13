<script lang="ts">
  import type { View, Visibility } from "@/features/html-studio/lib/core";

  let {
    title = $bindable(), view = $bindable(), visibility = $bindable(), narrow,
    saving, canSave, hasList, listOpen, rowCount, slug,
    onNew, onToggleList, onSave, onCopy,
  }: {
    title: string; view: View; visibility: Visibility; narrow: boolean;
    saving: boolean; canSave: boolean; hasList: boolean; listOpen: boolean;
    rowCount: number; slug: string | null;
    onNew: () => void; onToggleList: () => void; onSave: () => void; onCopy: () => void;
  } = $props();
</script>

<header class="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border bg-card px-2 py-2">
  <input bind:value={title} placeholder="Page title" class="h-8 min-w-28 flex-1 rounded-md border border-input bg-background px-3 text-sm" />
  <div class="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
    <button type="button" class:font-semibold={view === "code"} class="h-7 rounded px-2 text-xs hover:bg-muted" onclick={() => (view = "code")}>Code</button>
    {#if !narrow}<button type="button" class:font-semibold={view === "split"} class="h-7 rounded px-2 text-xs hover:bg-muted" onclick={() => (view = "split")}>Split</button>{/if}
    <button type="button" class:font-semibold={view === "preview"} class="h-7 rounded px-2 text-xs hover:bg-muted" onclick={() => (view = "preview")}>Preview</button>
  </div>
  <button type="button" class="h-8 rounded-md px-2 text-xs hover:bg-muted" onclick={() => (visibility = visibility === "public" ? "private" : "public")}>{visibility === "private" ? "Private" : "Public"}</button>
  <button type="button" class="h-8 rounded-md px-2 text-xs hover:bg-muted" onclick={onNew}>New</button>
  {#if hasList}<button type="button" class="h-8 rounded-md px-2 text-xs hover:bg-muted" class:bg-muted={listOpen} onclick={onToggleList}>Saved{rowCount ? ` ${rowCount}` : ""}</button>{/if}
  {#if canSave}<button type="button" class="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50" onclick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>{/if}
  <button type="button" class="h-8 rounded-md border border-border px-2 text-xs disabled:opacity-50" onclick={onCopy} disabled={!slug}>Copy link</button>
</header>
