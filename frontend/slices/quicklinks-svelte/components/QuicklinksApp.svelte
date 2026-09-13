<script lang="ts">
  import { faviconUrl, openQuicklink } from "../../quicklinks/lib/core";
  import { quicklinksStore } from "../lib/store";

  let items = $derived($quicklinksStore);
</script>

<div class="@container h-full overflow-auto bg-background text-foreground">
  {#if items.length === 0}
    <div class="grid h-full min-h-64 place-items-center p-6 text-center">
      <div class="space-y-2 text-muted-foreground">
        <svg class="mx-auto size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
          <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
        </svg>
        <p class="text-sm font-medium text-foreground">No quicklinks yet</p>
        <p class="text-xs">Add website shortcuts through the configured quicklinks store.</p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-4 p-5 @sm:grid-cols-4 @md:grid-cols-5">
      {#each items as quicklink (quicklink.id)}
        {@const src = faviconUrl(quicklink.url)}
        <button
          type="button"
          class="group flex h-auto min-w-0 flex-col items-center gap-2 rounded-md p-2 text-center hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open ${quicklink.title}`}
          onclick={() => openQuicklink(quicklink)}
        >
          <span class="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white text-zinc-500 shadow-md ring-1 ring-black/10 transition-transform group-hover:scale-105">
            {#if src}
              <img src={src} alt="" width="36" height="36" class="size-9 object-contain" />
            {:else}
              <svg class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
            {/if}
          </span>
          <span class="max-w-full truncate text-xs font-medium">{quicklink.title}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
