# feedback-states — Svelte 5 / SvelteKit

Install this distribution with:

```sh
npx rr add feedback-states --framework sveltekit
```

The default `npx rr add feedback-states` remains the canonical React/Next distribution. This Svelte variant is framework-neutral client UI: loading skeletons/spinners plus empty and error states. It needs Svelte 5 and no shadcn or icon package.

```svelte
<script lang="ts">
  import { FeedbackLoadingSkeleton, FeedbackEmptyState } from "$lib/slices/feedback-states";
</script>

<FeedbackLoadingSkeleton kind="card" />
<FeedbackEmptyState kind="empty-list" />
```

For a single surface, use `npx rr add feedback-states loading --framework sveltekit` or `empty` respectively.
