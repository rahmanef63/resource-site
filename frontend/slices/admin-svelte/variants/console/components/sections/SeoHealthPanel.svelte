<script lang="ts">
  import {
    MOCK_SEO,
    type SeoPage,
  } from "@/features/admin/variants/console/lib/mock";

  let { pages = MOCK_SEO }: { pages?: SeoPage[] } = $props();
  let average = $derived(
    pages.length
      ? Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length)
      : 0,
  );

  const tone = (score: number) =>
    score >= 85 ? "text-success" : score >= 70 ? "text-amber-600" : "text-destructive";
</script>

<div class="space-y-4">
  <article class="rounded-xl border bg-card p-4 shadow-sm">
    <p class="text-sm font-semibold">Site SEO score</p>
    <div class="mt-3 flex items-center gap-4">
      <strong class={`text-3xl tabular-nums ${tone(average)}`}>{average}</strong>
      <progress class="h-2 flex-1" max="100" value={average}>{average}</progress>
    </div>
  </article>

  <div class="grid gap-3 sm:grid-cols-2">
    {#each pages as page (page.path)}
      <article class="rounded-xl border bg-card p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold">{page.title}</h3>
            <p class="font-mono text-xs text-muted-foreground">{page.path}</p>
          </div>
          <strong class={`text-lg tabular-nums ${tone(page.score)}`}>{page.score}</strong>
        </div>
        {#if page.issues.length === 0}
          <p class="mt-3 text-sm text-success">No issues</p>
        {:else}
          <ul class="mt-3 space-y-1 text-sm text-muted-foreground">
            {#each page.issues as issue (issue)}
              <li>• {issue}</li>
            {/each}
          </ul>
          <span class="mt-3 inline-flex rounded-full border px-2 py-0.5 text-xs">
            {page.issues.length} issue{page.issues.length > 1 ? "s" : ""}
          </span>
        {/if}
      </article>
    {/each}
  </div>
</div>
