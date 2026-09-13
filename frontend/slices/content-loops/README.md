# Content Loops

A data-source-driven repeater. Register a pluggable `LoopEntitySource`, fetch
items through one framework-neutral pagination controller, then render one
variant per item in deterministic round-robin order.

React/Next remains the default distribution. Svelte 5/SvelteKit uses the exact
same types, registry, mock source, pagination controller, and variant selector.

```bash
npx rr add content-loops
npx rr add content-loops --framework sveltekit
```

## React / Next (default)

```tsx
import { ContentLoop, createMockLoopSource } from "@/features/content-loops";

const source = createMockLoopSource();

<ContentLoop
  source={source}
  pagination="infinite"
  pageSize={6}
  className="grid gap-4 sm:grid-cols-2"
  variants={[
    ({ item }) => <Card title={String(item.fields.title)} />,
    ({ item }) => <FeaturedCard title={String(item.fields.title)} />,
  ]}
/>;
```

## Svelte 5 / SvelteKit

```svelte
<script lang="ts">
  import { ContentLoop, createMockLoopSource } from "@/features/content-loops-svelte";
  const source = createMockLoopSource();
</script>

{#snippet card(item, index)}
  <article>{index + 1}. {String(item.fields.title)}</article>
{/snippet}

<ContentLoop {source} pagination="infinite" pageSize={6} variants={[card]} />
```

- `variants` round-robin: item `i` renders `variants[i % variants.length]`.
- `pagination="none"` fetches one page capped by `limit`.
- `pagination="infinite"` accumulates `pageSize` chunks behind Load more.
- Pass `source` inline or register a namespaced source and pass `sourceId`.
- Loading, error, empty, filters, ordering, and direction semantics are shared.

## Write your own source

```ts
import { loopSourceRegistry, type LoopEntitySource } from "@/features/content-loops";

const postsSource: LoopEntitySource = {
  id: "blog.posts",
  label: "Blog posts",
  fields: [{ id: "title", label: "Title" }],
  orderByOptions: [{ id: "publishedAt", label: "Newest" }],
  async fetch({ filters, orderBy, direction, limit, offset }) {
    const { rows, total } = await fetchMyPosts({ filters, orderBy, direction, limit, offset });
    return {
      items: rows.map((row) => ({ id: row._id, fields: { title: row.title } })),
      totalItems: total,
    };
  },
};

loopSourceRegistry.registerOrReplace(postsSource);
```

Source ids must be namespaced (`namespace.name`). `LoopItem.fields` must already
contain resolved values so render variants never need a second lookup.
