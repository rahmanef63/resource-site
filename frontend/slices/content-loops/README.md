# Content Loops

A data-source-driven **repeater**. Pick a source, render one component per item,
round-robin items across variants. Harvested + decoupled from the Instatic CMS
`base.loop` engine — the publisher / page-tree / entryStack machinery is stripped
to props, so this is a plain React + injected-source slice.

```bash
npx rr add content-loops
```

## Use it

```tsx
import { ContentLoop, createMockLoopSource } from "@/features/content-loops";

const source = createMockLoopSource(); // swap for your own (below)

<ContentLoop
  source={source}
  pagination="infinite"
  pageSize={6}
  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  variants={[
    ({ item }) => <Card title={String(item.fields.title)} />,
    ({ item }) => <FeaturedCard title={String(item.fields.title)} />,
  ]}
/>;
```

- `variants` round-robin: item `i` renders `variants[i % variants.length]`.
- `pagination="none"` renders up to `limit`; `"infinite"` adds a **Load more** button.
- Pass `source` inline, or register it and pass `sourceId`.

## Write your own source

A source is just an id + fields + an async `fetch`. The contract is identical to
the mock — point `fetch` at Convex, REST, or anything:

```ts
import { loopSourceRegistry, type LoopEntitySource } from "@/features/content-loops";

const postsSource: LoopEntitySource = {
  id: "blog.posts", // MUST be namespaced "namespace.name"
  label: "Blog posts",
  fields: [
    { id: "title", label: "Title" },
    { id: "cover", label: "Cover", format: "media" },
  ],
  orderByOptions: [{ id: "publishedAt", label: "Newest" }],
  async fetch({ filters, orderBy, direction, limit, offset }) {
    const { rows, total } = await fetchMyPosts({ filters, orderBy, direction, limit, offset });
    return {
      items: rows.map((r) => ({ id: r._id, fields: { title: r.title, cover: r.coverUrl } })),
      totalItems: total,
    };
  },
};

loopSourceRegistry.registerOrReplace(postsSource);
// then: <ContentLoop sourceId="blog.posts" variants={[...]} />
```

`LoopItem.fields` holds **resolved** values (resolve media paths / author names
inside `fetch`), so variants are a one-line lookup: `item.fields.title`.

## What it ships

| Export | What |
|---|---|
| `<ContentLoop>` | the repeater component |
| `useLoopPagination` / `useLoopItems` | resolve items (with / without load-more) |
| `loopSourceRegistry` | register sources by namespaced id |
| `createMockLoopSource` | synthetic source so it runs env-free |

UI-only, no Convex. Add a backend source when you have one.
