# library — Svelte 5 / SvelteKit

Native Svelte renderer for the same Library model, defaults, tools, and Convex backend as the React/Next default.

```svelte
<script lang="ts">
  import { LibraryIndex, type LibraryRow } from "@/features/library-svelte";
  let { items }: { items: LibraryRow[] } = $props();
</script>

<LibraryIndex {items} />
```

The Svelte distribution is prop-driven: fetch `listPublic` / `getBySlug` with your preferred Convex client or server loader and pass rows into `LibraryIndex` / `LibraryDetail`. The backend stays exactly `convex/features/library`; no Svelte-specific tables or mutations are created.

`LibraryDetail` keeps upvoting opt-in through `onUpvote`. Prompt/snippet copy uses the Clipboard API with lifecycle timer cleanup. Video payloads reuse the shared YouTube/Vimeo/native resolver; native videos accept optional `videoCaptionsUrl` for captions.

Install the `seo` peer first because the shared Convex schema reuses its SEO field validators.
