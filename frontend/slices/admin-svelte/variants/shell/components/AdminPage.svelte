<script lang="ts">
  import {
    resolveAdminLabels,
    type SliceAdminLabels,
  } from "@/features/admin/variants/shell/lib/registry-labels";

  let { labels }: { labels?: SliceAdminLabels } = $props();
  let copy = $derived(resolveAdminLabels(labels));
</script>

<section class="mx-auto w-full max-w-6xl space-y-6 p-6">
  <header>
    <h1 class="text-2xl font-semibold tracking-tight">{copy.title}</h1>
    <p class="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
  </header>

  <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="p-6 pb-3">
      <h2 class="font-semibold leading-none tracking-tight">{copy.emptyHeading}</h2>
    </div>
    <div class="p-6 pt-0 text-sm text-muted-foreground">{copy.emptyBody}</div>
  </div>
</section>
