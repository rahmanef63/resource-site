# activity — Svelte 5 / SvelteKit distribution

Native Svelte public activity feed for the canonical `activity` slice. React/Next
remains the default distribution. Both UIs share the same activity types,
ISO-week grouping, locale-aware formatting, English defaults, stats presentation
model, feature config, and Convex backend.

```svelte
<script lang="ts">
  import { ActivityFeed } from "@/features/activity-svelte";

  // rows = result of activity listPublic
  // stats = result of activity statsThisWeek
</script>

<ActivityFeed {rows} {stats} locale="en-US" />
```

The Svelte distribution intentionally has no React, Next, Lucide, or shadcn UI
runtime. The existing `convex/features/activity` schema/queries/internal mutations
are copied unchanged, so public visibility filtering and consumer-owned auth
wrapping remain identical across frameworks.
