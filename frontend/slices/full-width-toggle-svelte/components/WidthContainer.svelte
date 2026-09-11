<script lang="ts">
  import { onMount } from "svelte";
  import {
    DEFAULT_WIDTH_MODE,
    WIDTH_MODE_STORAGE_KEY,
    readWidthMode,
    widthClass,
    type WidthMode,
  } from "../lib/width-mode";

  type Props = {
    as?: "div" | "main" | "section" | "article";
    force?: WidthMode;
    class?: string;
    children?: import("svelte").Snippet;
  };

  let {
    as = "div",
    force,
    class: className = "",
    children,
  }: Props = $props();

  let mode = $state<WidthMode>(DEFAULT_WIDTH_MODE);
  let effective = $derived(force ?? mode);

  onMount(() => {
    mode = readWidthMode(window.localStorage);
    const onStorage = (event: StorageEvent) => {
      if (event.key === WIDTH_MODE_STORAGE_KEY) mode = readWidthMode(window.localStorage);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });
</script>

<svelte:element this={as} class={[widthClass(effective), className].filter(Boolean).join(" ")}>
  {@render children?.()}
</svelte:element>
