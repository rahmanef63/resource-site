<script lang="ts">
  import type { AboutFaq } from "@/features/profile/lib/core";

  let { items } = $props<{ items: AboutFaq[] }>();
  let open = $state<number | null>(0);
</script>

<div class="flex flex-col gap-1.5">
  {#each items as item, index (item.q)}
    {@const isOpen = open === index}
    <div class="rounded-lg border border-border bg-card/60">
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium"
        aria-expanded={isOpen}
        onclick={() => open = isOpen ? null : index}
      >
        <span class="text-muted-foreground transition-transform" class:-rotate-90={!isOpen} aria-hidden="true">⌄</span>
        <span class="flex-1">{item.q}</span>
      </button>
      {#if isOpen}
        <p class="px-3 pb-3 pl-9 text-xs leading-relaxed text-muted-foreground">{item.a}</p>
      {/if}
    </div>
  {/each}
</div>
