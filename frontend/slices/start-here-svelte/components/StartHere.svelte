<script lang="ts">
  import { startHereApi } from "../lib/host";
  import { resolveStartHereStages } from "../lib/journey";

  let api = $derived($startHereApi);
  let visibleStages = $derived(resolveStartHereStages(api.apps, api.stages));
</script>

<section class="w-full bg-background text-foreground">
  <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-8 flex flex-col gap-3">
      <h2 class="flex items-center gap-2 text-3xl font-semibold tracking-tight">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-foreground/80">
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="m16 8-4 8-4-4-4 4" />
            <path d="M12 4v1" />
            <path d="M12 19v1" />
          </svg>
        </span>
        Start Here
      </h2>
      <p class="max-w-3xl text-sm text-muted-foreground">
        Follow these guided steps to discover your apps and move through onboarding in order.
      </p>
    </div>

    <div class="space-y-6">
      {#each visibleStages as stage, i}
        <article class="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
          <div class="border-b border-border px-4 py-4 sm:px-6">
            <div class="flex items-start gap-3">
              <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground/90">
                {i + 1}
              </span>
              <div class="min-w-0">
                <h3 class="text-lg font-semibold">{stage.title}</h3>
                {#if stage.blurb}
                  <p class="mt-1 text-sm text-muted-foreground">{stage.blurb}</p>
                {/if}
              </div>
            </div>
          </div>

          <div class="px-4 py-4 sm:px-6">
            <div class="flex flex-wrap gap-3">
              {#each stage.apps as app}
                <button
                  type="button"
                  class="flex min-w-[210px] flex-1 items-start gap-3 rounded-md border border-border bg-background p-3 text-left transition-colors hover:border-foreground/20 hover:bg-accent/50"
                  aria-label={`Open ${app.title}`}
                  onclick={() => api.open(app.id)}
                >
                  <span class="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground/90">
                    <svg
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 12h16" />
                      <path d="m10 18 6-6-6-6" />
                    </svg>
                  </span>
                  <span class="min-w-0">
                    <span class="block text-sm font-medium text-foreground">{app.title}</span>
                    {#if app.description}
                      <span class="mt-1 block text-xs text-muted-foreground">{app.description}</span>
                    {/if}
                  </span>
                </button>
              {/each}
            </div>
          </div>
        </article>

        {#if i < visibleStages.length - 1}
          <div class="flex justify-center">
            <svg
              class="h-6 w-6 text-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v14" />
              <path d="m8 13 4 4 4-4" />
            </svg>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</section>
