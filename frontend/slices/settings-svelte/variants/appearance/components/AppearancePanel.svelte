<script lang="ts">
  import type {
    AppearanceAdapter,
    SegSetting,
  } from "@/features/settings/variants/appearance/lib/types";
  import AccentSwatches from "./AccentSwatches.svelte";
  import Segmented from "./Segmented.svelte";
  import SettingsRow from "./SettingsRow.svelte";
  import SettingsSection from "./SettingsSection.svelte";

  let { appearance: a } = $props<{ appearance: AppearanceAdapter }>();
</script>

{#snippet segRow(label: string, seg: SegSetting)}
  <SettingsRow {label}>
    <Segmented options={seg.options} value={seg.value} onChange={seg.onChange} />
  </SettingsRow>
{/snippet}

<div class="space-y-5">
  <SettingsSection icon="◐" title="Appearance">
    {#if a.style}{@render segRow("Style", a.style)}{/if}
    {#if a.theme}{@render segRow("Mode", a.theme)}{/if}
    {#if a.accent}
      <SettingsRow label="Accent">
        <AccentSwatches value={a.accent.value} options={a.accent.options} onSelect={a.accent.onChange} />
      </SettingsRow>
    {/if}
    {#if a.wallpaper}{@render segRow("Wallpaper", a.wallpaper)}{/if}
    {#if a.reduceTransparency}
      <SettingsRow label="Reduce transparency">
        <input
          type="checkbox"
          checked={a.reduceTransparency.value}
          onchange={(event) => a.reduceTransparency?.onChange(event.currentTarget.checked)}
          class="size-4 accent-[var(--primary)]"
        />
      </SettingsRow>
    {/if}
  </SettingsSection>

  {#if a.shellDesktop || a.shellMobile}
    <SettingsSection icon="▦" title="Shell">
      {#if a.shellDesktop}{@render segRow("Desktop layout", a.shellDesktop)}{/if}
      {#if a.shellMobile}{@render segRow("Mobile layout", a.shellMobile)}{/if}
    </SettingsSection>
  {/if}

  {#if a.device}
    <SettingsSection icon="▣" title="Display">
      {@render segRow("Device", a.device)}
    </SettingsSection>
  {/if}
</div>
