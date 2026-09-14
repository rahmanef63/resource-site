<div class="w-full space-y-3" aria-busy="true" aria-label="Loading icon picker">
  <div class="flex items-center gap-2">
    <div class="h-8 w-32 animate-pulse rounded bg-muted/60"></div>
    <div class="ml-auto h-8 w-20 animate-pulse rounded bg-muted/60"></div>
  </div>
  <div class="flex items-center gap-1.5">
    <div class="h-3 w-10 animate-pulse rounded bg-muted/40"></div>
    {#each Array(10) as _, i (i)}
      <div class="h-5 w-5 animate-pulse rounded-full bg-muted/60"></div>
    {/each}
  </div>
  <div class="h-8 w-full animate-pulse rounded bg-muted/40"></div>
  <div class="grid grid-cols-8 gap-1 overflow-hidden">
    {#each Array(48) as _, i (i)}
      <div class="h-8 w-8 animate-pulse rounded bg-muted/50"></div>
    {/each}
  </div>
</div>
