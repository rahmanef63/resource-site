# `vector-search` slice

Framework-neutral semantic-search adapter contract. This slice intentionally does **not** ship a renderer, Convex schema, vector table, embedding action, or provider credential.

## Install

```bash
npx rr add vector-search
npx rr add vector-search --framework sveltekit
```

Both commands install the same TypeScript source. No React, Next, Svelte, Convex, OpenAI, Lucide, or shadcn runtime dependency is added by this contract.

## Bind the host transport

```ts
import { vectorSearchTools, type VectorSearchCtx } from "@/features/vector-search";

const vectorSearch: VectorSearchCtx = {
  search: (query, topK) => hostVectorIndex.search(query, topK),
  index: (text, title) => guardedIndexDocument({ text, title }),
  reindex: () => guardedReindex(),
};

// Register vectorSearchTools with vectorSearch in your tool host.
```

The host owns the actual vector database/index, embedding model, API keys, authorization, persistence, workspace isolation, and confirmation policy. If you use OpenAI embeddings, keep the key server-side.
