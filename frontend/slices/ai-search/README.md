# ai-search

Perplexity-style answer engine over a workspace corpus. Streaming answer with inline numbered citations + source cards strip + follow-up suggestions.

## Install

```bash
npx rr add ai-search
```

Peers: `convex-auth`, `ai-router`, `ai-admin`, `vector-search`.

## Usage

```tsx
import { AskBox } from "@/features/ai-search";

export default function AskPage() {
  return <AskBox />;
}
```

## Surfaces

- **Public** — `<AskBox />` — question input → streaming answer + citations + follow-ups.
- **Admin** — corpus sources (URLs / Notion / Slack / files / GitHub), crawl schedule, reranker tuning, per-source weight. Mounts as `admin-panel` section.

## Status

**Scaffold (0.1.0)** — contract + metadata + types. Real impl pending. UX target at `/preview/slices/ai-search`.
