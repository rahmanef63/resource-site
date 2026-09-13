<script lang="ts">
  import { groupPresetOptions, type PresetOption } from "../../site-setup-wizard/lib/core";

  let {
    value,
    options,
    defaultLabel = "Bawaan template",
    onChange,
    onPreview,
  }: {
    value: string;
    options: PresetOption[];
    defaultLabel?: string;
    onChange: (name: string) => void;
    onPreview?: (name: string | null) => void;
  } = $props();

  let open = $state(false);
  let groups = $derived(groupPresetOptions(options));
  let currentLabel = $derived(
    value ? (options.find((option) => option.name === value)?.label ?? value) : defaultLabel,
  );

  function pick(name: string) {
    onChange(name);
    onPreview?.(name || null);
    open = false;
  }
</script>

<div class="relative">
  <button
    type="button"
    class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class:value-muted={!value}>{currentLabel}</span>
    <span aria-hidden="true">⌄</span>
  </button>

  {#if open}
    <div class="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
      <button
        type="button"
        class="w-full rounded px-2 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
        onclick={() => pick("")}
      >
        {defaultLabel}
      </button>
      <div class="my-1 h-px bg-border"></div>
      {#each groups as group}
        {#if group.group}
          <div class="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">{group.group}</div>
        {/if}
        {#each group.items as option (option.name)}
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-accent"
            class:bg-accent={value === option.name}
            onclick={() => pick(option.name)}
          >
            {#if option.swatches?.length}
              <span class="flex shrink-0 -space-x-1" aria-hidden="true">
                {#each option.swatches.slice(0, 5) as color}
                  <span
                    class="size-3 rounded-full border border-border/60"
                    style:background-color={color}
                  ></span>
                {/each}
              </span>
            {/if}
            <span>{option.label ?? option.name}</span>
          </button>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .value-muted { color: var(--muted-foreground); }
</style>
