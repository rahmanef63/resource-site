<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import {
    THEME_PRESET_CONTEXT_KEY,
    type SvelteThemePresetStore,
  } from "../lib/store";

  let {
    onSave,
    presetStore,
  }: {
    onSave: (preset: string | null) => Promise<unknown>;
    presetStore?: SvelteThemePresetStore;
  } = $props();

  const contextual = getContext<SvelteThemePresetStore | undefined>(THEME_PRESET_CONTEXT_KEY);
  function initialStore() {
    const store = presetStore ?? contextual;
    if (!store) throw new Error("SaveSiteDefaultButton requires ThemePresetProvider or presetStore");
    return store;
  }

  const store = initialStore();
  let snapshot = $state(store.getSnapshot());
  let busy = $state(false);
  let saved = $state(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => store.subscribe((next) => { snapshot = next; }));
  onDestroy(() => { if (timer) clearTimeout(timer); });

  async function save() {
    busy = true;
    try {
      await onSave(snapshot.presetName);
      saved = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { saved = false; }, 2000);
    } finally {
      busy = false;
    }
  }
</script>

<button
  type="button"
  class="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium disabled:opacity-50"
  disabled={busy}
  title="Semua pengunjung melihat preset ini secara default; mereka tetap bisa memilih sendiri lewat switcher."
  onclick={save}
>
  <span aria-hidden="true">{busy ? "…" : saved ? "✓" : "☆"}</span>
  Jadikan default situs
</button>
