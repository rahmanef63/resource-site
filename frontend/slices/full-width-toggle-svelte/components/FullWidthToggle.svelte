<script lang="ts">
  import { onMount } from "svelte";
  import {
    DEFAULT_WIDTH_MODE,
    WIDTH_MODE_STORAGE_KEY,
    WIDTH_MODES,
    nextWidthMode,
    readWidthMode,
    writeWidthMode,
    type WidthMode,
  } from "../lib/width-mode";

  type ToggleVariant = "icon" | "button" | "segment";
  type ToggleCopy = {
    label: Record<WidthMode, string>;
    title: Record<WidthMode, string>;
  };

  type Props = {
    variant?: ToggleVariant;
    copy?: Partial<ToggleCopy>;
    class?: string;
    disabled?: boolean;
  };

  const DEFAULT_COPY: ToggleCopy = {
    label: { contained: "Contained", wide: "Wide", full: "Full width" },
    title: {
      contained: "Comfortable width (~1280px) — click for Wide",
      wide: "Large width (~1536px) — click for Full",
      full: "Edge-to-edge — click for Contained",
    },
  };

  let {
    variant = "icon",
    copy,
    class: className = "",
    disabled = false,
  }: Props = $props();

  let mode = $state<WidthMode>(DEFAULT_WIDTH_MODE);
  let label = $derived({ ...DEFAULT_COPY.label, ...copy?.label });
  let title = $derived({ ...DEFAULT_COPY.title, ...copy?.title });

  onMount(() => {
    mode = readWidthMode(window.localStorage);
    const onStorage = (event: StorageEvent) => {
      if (event.key === WIDTH_MODE_STORAGE_KEY) mode = readWidthMode(window.localStorage);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });

  function setMode(next: WidthMode) {
    if (disabled) return;
    mode = next;
    if (typeof window !== "undefined") {
      writeWidthMode(next, window.localStorage, window);
    }
  }

  function cycle() {
    setMode(nextWidthMode(mode));
  }

  const iconClass = "size-4";
</script>

{#if variant === "segment"}
  <div class={`inline-flex rounded-md border border-input p-0.5 ${className}`} aria-label="Layout width">
    {#each WIDTH_MODES as item}
      <button
        type="button"
        class={`inline-flex h-auto items-center gap-1.5 rounded px-2.5 py-1 text-xs transition ${mode === item ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50"}`}
        title={title[item]}
        aria-pressed={mode === item}
        {disabled}
        onclick={() => setMode(item)}
      >
        {@render WidthIcon(item, "size-3.5")}
        {label[item]}
      </button>
    {/each}
  </div>
{:else if variant === "button"}
  <button
    type="button"
    class={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
    title={title[mode]}
    {disabled}
    onclick={cycle}
  >
    {@render WidthIcon(mode, iconClass)}
    <span class="ml-1.5">{label[mode]}</span>
  </button>
{:else}
  <button
    type="button"
    class={`inline-flex size-8 items-center justify-center rounded-md transition hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
    title={title[mode]}
    aria-label={`Layout width: ${label[mode]}`}
    {disabled}
    onclick={cycle}
  >
    {@render WidthIcon(mode, iconClass)}
  </button>
{/if}

{#snippet WidthIcon(value: WidthMode, className: string)}
  <svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {#if value === "contained"}
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      <path d="M9 12h6" />
    {:else if value === "wide"}
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    {:else}
      <path d="M15 3h6v6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
      <path d="M9 21H3v-6" />
    {/if}
  </svg>
{/snippet}
