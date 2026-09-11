<script lang="ts">
  type LoadingStateVariant = "inline" | "block" | "overlay";

  type Props = {
    /** Visible label next to the spinner. */
    label?: string;
    /** inline = flowing text, block = panel body, overlay = relative parent veil. */
    variant?: LoadingStateVariant;
    class?: string;
  };

  let {
    label = "Loading…",
    variant = "block",
    class: className = "",
  }: Props = $props();
</script>

{#if variant === "inline"}
  <span aria-busy="true" class={`inline-flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
    <span class="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    {label}
  </span>
{:else if variant === "overlay"}
  <div aria-busy="true" class={`absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/60 text-sm text-muted-foreground backdrop-blur-[2px] ${className}`}>
    <span class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    {label}
  </div>
{:else}
  <div aria-busy="true" class={`flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground ${className}`}>
    <span class="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    {label}
  </div>
{/if}
