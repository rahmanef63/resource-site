<script lang="ts">
  import {
    SETTINGS_DENSITIES,
    SETTINGS_LANGUAGES,
    SETTINGS_THEMES,
  } from "@/features/settings/variants/account/lib/core";
  import type {
    DensityPref,
    SettingsPreferences,
    ThemePref,
  } from "@/features/settings/variants/account/lib/adapter";

  let {
    value,
    saving = false,
    onSave,
  } = $props<{
    value: SettingsPreferences;
    saving?: boolean;
    onSave: (preferences: SettingsPreferences) => void | Promise<void>;
  }>();

  let draft = $state<SettingsPreferences>({ theme: "system", language: "en", density: "comfortable" });
  let dirty = $derived(JSON.stringify(draft) !== JSON.stringify(value));

  $effect(() => {
    draft = { ...value };
  });

  function patch(next: Partial<SettingsPreferences>) {
    draft = { ...draft, ...next };
  }
</script>

<section class="rounded-xl border bg-card text-card-foreground shadow-sm">
  <header class="space-y-1.5 border-b px-5 py-4">
    <h2 class="font-semibold">Preferences</h2>
    <p class="text-sm text-muted-foreground">Appearance and locale for this account.</p>
  </header>
  <div class="space-y-5 p-5">
    <label class="block space-y-1.5 text-sm">
      <span class="font-medium">Theme</span>
      <select
        value={draft.theme}
        onchange={(event) => patch({ theme: event.currentTarget.value as ThemePref })}
        class="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-60"
      >
        {#each SETTINGS_THEMES as theme}
          <option value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>
        {/each}
      </select>
    </label>

    <label class="block space-y-1.5 text-sm">
      <span class="font-medium">Language</span>
      <select
        value={draft.language}
        onchange={(event) => patch({ language: event.currentTarget.value })}
        class="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-60"
      >
        {#each SETTINGS_LANGUAGES as language}
          <option value={language.value}>{language.label}</option>
        {/each}
      </select>
    </label>

    <div class="space-y-1.5 text-sm">
      <span class="font-medium">Density</span>
      <div class="inline-flex rounded-md border p-0.5">
        {#each SETTINGS_DENSITIES as density}
          <button
            type="button"
            onclick={() => patch({ density: density as DensityPref })}
            class={`rounded px-3 py-1 text-xs capitalize ${draft.density === density ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {density}
          </button>
        {/each}
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="button"
        disabled={saving || !dirty}
        onclick={() => onSave(draft)}
        class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  </div>
</section>
