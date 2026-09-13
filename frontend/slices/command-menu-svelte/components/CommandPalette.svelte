<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    filterCommandGroups,
    isCommandMenuHotkey,
    resolvePaletteLabels,
    runCommandSelection,
    type CommandGroupBase,
    type CommandItemBase,
    type CommandPaletteLabels,
  } from "../../command-menu/lib/core";
  import { loadHistory, type HistoryEntry } from "../../command-menu/lib/cmdkHistory";
  import CommandGroupList from "./CommandGroupList.svelte";

  let {
    groups,
    onHistorySelect,
    labels,
    placeholder,
    disableHotkey = false,
    open = $bindable(false),
    onOpenChange,
    query = $bindable(""),
    onQueryChange,
    renderIcon,
    renderTrailing,
  } = $props<{
    groups: CommandGroupBase[];
    onHistorySelect?: (entry: HistoryEntry) => void | Promise<void>;
    labels?: CommandPaletteLabels;
    placeholder?: string;
    disableHotkey?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    query?: string;
    onQueryChange?: (query: string) => void;
    renderIcon?: Snippet<[CommandItemBase]>;
    renderTrailing?: Snippet<[CommandItemBase]>;
  }>();

  let inputElement = $state<HTMLInputElement>();
  let history = $state<HistoryEntry[]>([]);
  let active = $state(0);
  let resolved = $derived(resolvePaletteLabels(labels));
  let inputPlaceholder = $derived(placeholder ?? resolved.placeholder);
  let filtered = $derived(filterCommandGroups(groups, query));
  let flatItems = $derived(filtered.flatMap((group) => group.items));

  function setOpen(value: boolean) {
    open = value;
    onOpenChange?.(value);
  }

  function setQuery(value: string) {
    query = value;
    active = 0;
    onQueryChange?.(value);
  }

  async function select(item: CommandItemBase) {
    history = await runCommandSelection(item, { close: () => setOpen(false) });
  }

  async function selectHistory(entry: HistoryEntry) {
    await select({
      id: `history:${entry.id}`,
      value: `history:${entry.id}`,
      label: entry.label,
      track: entry,
      onSelect: () => onHistorySelect?.(entry),
    });
  }

  function onInputKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = Math.min(active + 1, Math.max(0, flatItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = Math.max(active - 1, 0);
    } else if (event.key === "Enter" && flatItems[active]) {
      event.preventDefault();
      void select(flatItems[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  $effect(() => {
    if (!open) return;
    history = loadHistory();
    queueMicrotask(() => inputElement?.focus());
  });

  $effect(() => {
    if (disableHotkey || typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      if (!isCommandMenuHotkey(event)) return;
      event.preventDefault();
      setOpen(!open);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-4 pt-[12vh] backdrop-blur-sm" role="presentation" onclick={(event) => event.currentTarget === event.target && setOpen(false)}>
    <div class="w-full max-w-xl overflow-hidden rounded-xl border bg-popover shadow-2xl" role="dialog" aria-modal="true" aria-label="Command menu">
      <div class="flex items-center gap-2 border-b px-3 py-2">
        <span aria-hidden="true">⌕</span>
        <input
          bind:this={inputElement}
          value={query}
          oninput={(event) => setQuery(event.currentTarget.value)}
          onkeydown={onInputKey}
          placeholder={inputPlaceholder}
          class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label={inputPlaceholder}
        />
        <kbd class="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
      </div>

      <div class="max-h-[420px] overflow-y-auto p-1.5">
        {#if filtered.length === 0}
          <div class="px-3 py-8 text-center text-sm text-muted-foreground">{resolved.empty}</div>
        {:else}
          <CommandGroupList {groups} {query} {renderIcon} {renderTrailing} onSelect={select} />
        {/if}

        {#if !query.trim() && history.length > 0}
          <section class="mb-2" data-command-history>
            <div class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {resolved.recentCommandsHeading}
            </div>
            {#each history as entry (entry.id)}
              <button type="button" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent" onclick={() => selectHistory(entry)}>
                <span aria-hidden="true">↺</span>
                <span class="min-w-0 flex-1 truncate">{entry.label}</span>
              </button>
            {/each}
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}
