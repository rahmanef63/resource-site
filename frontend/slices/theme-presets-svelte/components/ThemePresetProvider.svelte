<script lang="ts">
  import { onMount, setContext, type Snippet } from "svelte";
  import {
    createSvelteThemePresetStore,
    THEME_PRESET_CONTEXT_KEY,
    type SvelteThemePresetStore,
  } from "../lib/store";
  import {
    createBrowserThemeModeStore,
    THEME_MODE_CONTEXT_KEY,
    type ThemeMode,
    type ThemeModeStore,
  } from "../lib/mode";

  let {
    children,
    hostDefault = null,
    siteDefault,
    defaultMode = "system",
    presetStore,
    modeStore,
  }: {
    children: Snippet;
    hostDefault?: string | null;
    siteDefault?: string | null;
    defaultMode?: ThemeMode;
    presetStore?: SvelteThemePresetStore;
    modeStore?: ThemeModeStore;
  } = $props();

  function initialPresetStore() {
    return presetStore ?? createSvelteThemePresetStore();
  }
  function initialModeStore() {
    return modeStore ?? createBrowserThemeModeStore(defaultMode);
  }

  const preset = initialPresetStore();
  const mode = initialModeStore();
  setContext(THEME_PRESET_CONTEXT_KEY, preset);
  setContext(THEME_MODE_CONTEXT_KEY, mode);

  $effect(() => {
    preset.setHostDefault(hostDefault);
  });

  $effect(() => {
    if (siteDefault !== undefined) preset.setSiteDefault(siteDefault);
  });

  onMount(() => {
    void preset.init();
    return mode.init();
  });
</script>

{@render children()}
