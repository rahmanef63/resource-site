<script lang="ts">
  let {
    value,
    options,
    onSelect,
  } = $props<{
    value: string;
    options: string[];
    onSelect: (color: string) => void;
  }>();
</script>

<div class="flex flex-wrap gap-2" aria-label="Accent color">
  {#each options as color}
    <button
      type="button"
      aria-label={`Use accent ${color}`}
      aria-pressed={value === color}
      onclick={() => onSelect(color)}
      class={`size-7 rounded-full border-2 ${value === color ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "border-transparent"}`}
      style:background={color}
    ></button>
  {/each}
</div>
