<script lang="ts">
  import type { SettingOption } from "@/features/settings/variants/appearance/lib/types";
  let {
    options,
    value,
    onChange,
  } = $props<{
    options: SettingOption[];
    value: string;
    onChange: (value: string) => void;
  }>();
</script>

<div class="inline-flex max-w-full flex-wrap rounded-md border p-0.5" role="group" aria-label="Setting options">
  {#each options as option}
    <button
      type="button"
      aria-pressed={value === option.value}
      onclick={() => onChange(option.value)}
      class={`rounded px-3 py-1.5 text-xs ${value === option.value ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {option.label}
    </button>
  {/each}
</div>
