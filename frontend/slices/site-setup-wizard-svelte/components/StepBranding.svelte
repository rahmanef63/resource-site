<script lang="ts">
  import type { Snippet } from "svelte";
  import Field from "./Field.svelte";
  import ThemePresetField from "./ThemePresetField.svelte";
  import type { OnboardingFields, PresetOption } from "../../site-setup-wizard/lib/core";

  const BRAND_CHIPS = [
    "#c4583a", "#d97706", "#16a34a", "#0d9488", "#2563eb", "#7c3aed", "#db2777", "#0f172a",
  ];
  const MODES = [
    { value: "light", label: "Terang" },
    { value: "dark", label: "Gelap" },
    { value: "system", label: "Sistem" },
  ];

  let {
    fields,
    setField,
    presetOptions,
    defaultPresetLabel,
    onPresetPreview,
    imageField,
  }: {
    fields: OnboardingFields;
    setField: (key: keyof OnboardingFields, value: string) => void;
    presetOptions?: PresetOption[];
    defaultPresetLabel?: string;
    onPresetPreview?: (name: string | null) => void;
    imageField?: Snippet<[kind: "logo" | "favicon", current: string, onUploaded: (url: string) => void]>;
  } = $props();
</script>

<div class="space-y-4">
  <div>
    <h1 class="text-xl font-semibold tracking-tight">Branding</h1>
    <p class="text-sm text-muted-foreground">Logo, favicon, warna — semua tersimpan di situs kamu.</p>
  </div>

  {#if imageField}
    <div class="grid grid-cols-2 gap-3">
      <Field label="Logo">
        {#if fields.logoUrl}
          <img src={fields.logoUrl} alt="logo" class="mb-2 h-10 w-auto rounded object-contain" />
        {/if}
        {@render imageField("logo", fields.logoUrl, (url) => setField("logoUrl", url))}
      </Field>
      <Field label="Favicon">
        {#if fields.faviconUrl}
          <img src={fields.faviconUrl} alt="favicon" class="mb-2 size-8 rounded object-contain" />
        {/if}
        {@render imageField("favicon", fields.faviconUrl, (url) => setField("faviconUrl", url))}
      </Field>
    </div>
  {/if}

  <Field label="Warna brand">
    <div class="flex flex-wrap items-center gap-1.5">
      {#each BRAND_CHIPS as color}
        <button
          type="button"
          aria-label={`Pilih warna ${color}`}
          class="size-7 rounded-full border border-border transition-transform hover:scale-110"
          class:ring-2={fields.brandColor.toLowerCase() === color}
          class:ring-ring={fields.brandColor.toLowerCase() === color}
          style:background-color={color}
          onclick={() => setField("brandColor", color)}
        ></button>
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <input
        type="color"
        class="h-10 w-16 rounded border border-input bg-background p-1"
        value={fields.brandColor}
        oninput={(event) => setField("brandColor", event.currentTarget.value)}
      />
      <input
        class="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        value={fields.brandColor}
        oninput={(event) => setField("brandColor", event.currentTarget.value)}
      />
    </div>
  </Field>

  <Field label="Tema default">
    <div class="flex gap-2">
      {#each MODES as mode}
        <button
          type="button"
          class="h-9 flex-1 rounded-md border px-3 text-sm font-medium"
          class:bg-primary={fields.themeDefault === mode.value}
          class:text-primary-foreground={fields.themeDefault === mode.value}
          class:border-input={fields.themeDefault !== mode.value}
          onclick={() => setField("themeDefault", mode.value)}
        >
          {mode.label}
        </button>
      {/each}
    </div>
  </Field>

  {#if presetOptions?.length}
    <Field label="Preset warna situs">
      <ThemePresetField
        value={fields.themePreset}
        options={presetOptions}
        defaultLabel={defaultPresetLabel}
        onChange={(name) => setField("themePreset", name)}
        onPreview={onPresetPreview}
      />
      <p class="text-xs text-muted-foreground">
        Langsung dipratinjau — tersimpan saat kamu menekan Selesai.
      </p>
    </Field>
  {/if}

  <Field label="Google Analytics ID (opsional)">
    <div class="flex items-center gap-2">
      <input
        class="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        value={fields.analyticsId}
        placeholder="G-XXXXXXX"
        oninput={(event) => setField("analyticsId", event.currentTarget.value)}
      />
      <a
        href="https://analytics.google.com/analytics/web/"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium"
      >Dapatkan ↗</a>
    </div>
  </Field>
</div>
