<script lang="ts">
  type LoadingKind = "text" | "card" | "list" | "table" | "form" | "page" | "block";

  type Props = {
    kind?: LoadingKind;
    count?: number;
    columns?: number;
    class?: string;
  };

  const DEFAULT_COUNTS: Record<LoadingKind, number> = {
    text: 3,
    card: 2,
    list: 3,
    table: 4,
    form: 3,
    page: 1,
    block: 1,
  };

  let {
    kind = "text",
    count,
    columns = 4,
    class: className = "",
  }: Props = $props();

  const lineIndexes = (total: number) => Array.from({ length: total }, (_, index) => index);
</script>

<div aria-busy="true" aria-live="polite" class={`w-full ${className}`}>
  {#if kind === "text"}
    <div class="space-y-2">
      {#each lineIndexes(count ?? DEFAULT_COUNTS.text) as index}
        <div class={`h-4 animate-pulse rounded bg-muted ${index === (count ?? DEFAULT_COUNTS.text) - 1 ? "w-2/3" : "w-full"}`}></div>
      {/each}
    </div>
  {:else if kind === "card"}
    <div class="space-y-4 rounded-lg border p-4">
      <div class="flex items-center gap-3">
        <div class="size-10 shrink-0 animate-pulse rounded-full bg-muted"></div>
        <div class="min-w-0 flex-1 space-y-2">
          <div class="h-4 w-1/3 animate-pulse rounded bg-muted"></div>
          <div class="h-3 w-1/4 animate-pulse rounded bg-muted"></div>
        </div>
      </div>
      {#each lineIndexes(Math.max(2, (count ?? DEFAULT_COUNTS.card) + 1)) as index}
        <div class={`h-4 animate-pulse rounded bg-muted ${index === Math.max(2, (count ?? DEFAULT_COUNTS.card) + 1) - 1 ? "w-2/3" : "w-full"}`}></div>
      {/each}
    </div>
  {:else if kind === "list"}
    <div class="space-y-3">
      {#each lineIndexes(count ?? DEFAULT_COUNTS.list)}
        <div class="flex items-center gap-3">
          <div class="size-9 shrink-0 animate-pulse rounded-full bg-muted"></div>
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="h-4 w-2/5 animate-pulse rounded bg-muted"></div>
            <div class="h-3 w-3/5 animate-pulse rounded bg-muted"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if kind === "table"}
    <div class="overflow-hidden rounded-lg border">
      <div class="flex gap-4 border-b bg-muted/40 px-4 py-3">
        {#each lineIndexes(columns)}
          <div class="h-4 flex-1 animate-pulse rounded bg-muted"></div>
        {/each}
      </div>
      {#each lineIndexes(count ?? DEFAULT_COUNTS.table)}
        <div class="flex gap-4 border-b px-4 py-3 last:border-b-0">
          {#each lineIndexes(columns) as index}
            <div class={`h-4 flex-1 animate-pulse rounded bg-muted ${index === 0 ? "w-1/2" : ""}`}></div>
          {/each}
        </div>
      {/each}
    </div>
  {:else if kind === "form"}
    <div class="space-y-5">
      {#each lineIndexes(count ?? DEFAULT_COUNTS.form)}
        <div class="space-y-2">
          <div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
          <div class="h-9 w-full animate-pulse rounded-md bg-muted"></div>
        </div>
      {/each}
      <div class="h-9 w-28 animate-pulse rounded-md bg-muted"></div>
    </div>
  {:else if kind === "page"}
    <div class="space-y-4">
      <div class="h-8 w-72 animate-pulse rounded bg-muted"></div>
      {#each ["w-full", "w-11/12", "w-9/12"] as width}
        <div class={`h-4 animate-pulse rounded bg-muted ${width}`}></div>
      {/each}
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="h-24 animate-pulse rounded-lg bg-muted"></div>
        <div class="h-24 animate-pulse rounded-lg bg-muted"></div>
      </div>
      <div class="h-48 animate-pulse rounded-lg bg-muted"></div>
    </div>
  {:else}
    <div class="h-full min-h-24 w-full animate-pulse rounded-lg bg-muted"></div>
  {/if}
</div>
