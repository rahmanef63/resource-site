<script lang="ts">
  import { getContext } from "svelte";
  import {
    groupTweakcnPresets,
    tweakcnSwatches,
    type TweakcnPresetGroup,
    type TweakcnPresetItem,
  } from "../../theme-presets/lib/tweakcn";
  import {
    THEME_PRESET_CONTEXT_KEY,
    type SvelteThemePresetStore,
  } from "../lib/store";
  import {
    THEME_MODE_CONTEXT_KEY,
    type ThemeMode,
    type ThemeModeStore,
  } from "../lib/mode";

  let {
    size = "sm",
    presetStore,
    modeStore,
  }: {
    size?: "sm" | "mobile";
    presetStore?: SvelteThemePresetStore;
    modeStore?: ThemeModeStore;
  } = $props();

  const contextualPreset = getContext<SvelteThemePresetStore | undefined>(THEME_PRESET_CONTEXT_KEY);
  const contextualMode = getContext<ThemeModeStore | undefined>(THEME_MODE_CONTEXT_KEY);
  function initialPresetStore() {
    const store = presetStore ?? contextualPreset;
    if (!store) throw new Error("ThemePresetSwitcher requires ThemePresetProvider or presetStore");
    return store;
  }
  function initialModeStore() {
    const store = modeStore ?? contextualMode;
    if (!store) throw new Error("ThemePresetSwitcher requires ThemePresetProvider or modeStore");
    return store;
  }

  const preset = initialPresetStore();
  const mode = initialModeStore();
  let presetSnapshot = $state(preset.getSnapshot());
  let modeSnapshot = $state(mode.getSnapshot());
  let open = $state(false);
  let groups = $derived<TweakcnPresetGroup<TweakcnPresetItem>[]>(
    presetSnapshot.registry ? groupTweakcnPresets(presetSnapshot.registry.items) : [],
  );
  let presetCount = $derived(groups.reduce((sum, group) => sum + group.items.length, 0));

  $effect(() => preset.subscribe((next) => { presetSnapshot = next; }));
  $effect(() => mode.subscribe((next) => { modeSnapshot = next; }));

  function close() {
    preset.restore();
    open = false;
  }
  function commit(name: string) {
    preset.setPreset(name);
    open = false;
  }
  function resetDefault() {
    preset.setPreset(null);
    open = false;
  }
  function pickMode(next: ThemeMode) {
    mode.setMode(next);
  }
</script>

<svelte:window onkeydown={(event) => event.key === "Escape" && open && close()} />

<div class="relative inline-block">
  <button
    type="button"
    aria-label="Theme and color preset"
    aria-expanded={open}
    class="inline-flex items-center justify-center gap-1.5 rounded-md px-2 text-sm font-medium hover:bg-accent"
    class:h-11={size === "mobile"}
    class:w-11={size === "mobile"}
    class:h-9={size === "sm"}
    onclick={() => open ? close() : (open = true)}
  >
    <span aria-hidden="true">◉</span>
    <span aria-hidden="true" class:rotate-180={open}>⌄</span>
  </button>

  {#if open}
    <div
      role="dialog"
      tabindex="-1"
      aria-label="Theme and color preset picker"
      class="absolute right-0 z-50 mt-2 flex h-[min(80vh,34rem)] w-[min(20rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
      onmouseleave={() => preset.restore()}
    >
      <div class="shrink-0 border-b border-border bg-popover/95 px-3 py-2">
        <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Display Mode</p>
        <div role="tablist" aria-label="Display mode" class="grid grid-cols-3 gap-1 rounded-md bg-muted/60 p-1">
          {#each ["light", "dark", "system"] as id}
            <button
              role="tab"
              aria-selected={modeSnapshot.mode === id}
              type="button"
              class="rounded px-2 py-1.5 text-xs font-medium capitalize"
              class:bg-background={modeSnapshot.mode === id}
              class:shadow-sm={modeSnapshot.mode === id}
              class:text-muted-foreground={modeSnapshot.mode !== id}
              onclick={() => pickMode(id as ThemeMode)}
            >
              {id === "light" ? "☀ Light" : id === "dark" ? "◐ Dark" : "◉ System"}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Color Preset <span class="font-normal text-muted-foreground/70">({presetCount})</span>
        </span>
        <button
          type="button"
          class="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          class:text-foreground={presetSnapshot.explicitPreset === null}
          onclick={resetDefault}
          onmouseenter={() => preset.preview(null)}
          onmouseleave={() => preset.restore()}
        >↺ Default</button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {#if groups.length === 0}
          <p class="px-3 py-6 text-center text-sm text-muted-foreground">Loading presets…</p>
        {/if}
        {#each groups as group (group.id)}
          <div>
            <div class="sticky top-0 z-10 border-b border-border/30 bg-popover/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              {group.label}
            </div>
            {#each group.items as item (item.name)}
              <button
                type="button"
                class="flex w-full items-center gap-3 border-b border-border/40 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                class:bg-accent={item.name === presetSnapshot.presetName}
                aria-pressed={item.name === presetSnapshot.presetName}
                onclick={() => commit(item.name)}
                onmouseenter={() => preset.preview(item.name)}
                onfocus={() => preset.preview(item.name)}
              >
                <span class="flex shrink-0 items-center gap-0.5" aria-hidden="true">
                  {#each tweakcnSwatches(item) as color}
                    <span class="block size-3 rounded-full ring-1 ring-foreground/25" style:background={color}></span>
                  {/each}
                </span>
                <span class="flex-1 truncate">{item.title}</span>
                {#if item.name === presetSnapshot.presetName}<span aria-hidden="true">•</span>{/if}
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
