<script lang="ts">
  import type { Snippet } from "svelte";
  import ThemePresetProvider from "./ThemePresetProvider.svelte";
  import type { ThemeMode } from "../lib/mode";
  import type { SvelteThemePresetStore } from "../lib/store";
  import type { ThemeModeStore } from "../lib/mode";

  let {
    children,
    defaultMode = "system",
    defaultPreset = null,
    siteDefault,
    presetStore,
    modeStore,
  }: {
    children: Snippet;
    defaultMode?: ThemeMode;
    defaultPreset?: string | null;
    siteDefault?: string | null;
    presetStore?: SvelteThemePresetStore;
    modeStore?: ThemeModeStore;
  } = $props();
</script>

<ThemePresetProvider
  hostDefault={defaultPreset}
  {siteDefault}
  {defaultMode}
  {presetStore}
  {modeStore}
>
  {@render children()}
</ThemePresetProvider>
