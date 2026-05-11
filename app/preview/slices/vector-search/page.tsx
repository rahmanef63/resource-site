"use client";

import * as React from "react";
import { Search, Sparkles } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock, FlowDiagram } from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DOCS = [
  { id: 1, title: "Memulai dengan Convex", body: "Self-hosted Convex via Docker Compose…", score: 0.92 },
  { id: 2, title: "Embedding workflow", body: "OpenAI text-embedding-3-small dengan 1536 dim…", score: 0.88 },
  { id: 3, title: "Hybrid search di Convex", body: "Vector index + filter kombinasi…", score: 0.84 },
  { id: 4, title: "Setup proxy.ts di Next 16", body: "Pengganti middleware.ts klasik…", score: 0.61 },
  { id: 5, title: "Dokploy DNS provisioning", body: "Wildcard A-record + Caddy reverse-proxy…", score: 0.42 },
];

export default function Page() {
  const [q, setQ] = React.useState("convex vector");
  const [shown, setShown] = React.useState(DOCS);

  React.useEffect(() => {
    const t = setTimeout(() => {
      const lower = q.toLowerCase();
      setShown(
        DOCS.map((d) => ({
          ...d,
          score: lower
            ? +(d.score - Math.random() * 0.1 + 0.05).toFixed(2)
            : d.score,
        }))
          .sort((a, b) => b.score - a.score),
      );
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <SlicePreviewLayout
      title="Convex Vector Search"
      kind="full"
      description="Embeddings-based semantic search. Convex vectorIndex + OpenAI text-embedding-3-small (1536d)."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/vector-search"
    >
      <PreviewSection title="Try a query">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari …"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            {shown.map((d) => (
              <Card key={d.id} className="flex items-baseline gap-3 p-3">
                <div className="flex-1">
                  <div className="text-sm font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.body}</div>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {d.score.toFixed(2)}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="How it works">
        <FlowDiagram
          steps={[
            { title: "Upsert doc", detail: "mutation → embed via OpenAI" },
            { title: "Persist", detail: "doc + embedding[1536] + vectorIndex" },
            { title: "Query", detail: "embed query → vectorSearch()" },
            { title: "Hybrid filter", detail: "Combine with .filter()/.withIndex() for facets" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// convex/features/search/schema.ts
documents: defineTable({ title, body, embedding: v.array(v.number()) })
  .vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536 }),

// convex/features/search/upsert.ts
const emb = await openai.embeddings.create({ model: "text-embedding-3-small", input: body });
await ctx.db.insert("documents", { title, body, embedding: emb.data[0].embedding });

// convex/features/search/query.ts
const queryEmb = await openai.embeddings.create({ model: "text-embedding-3-small", input: q });
const hits = await ctx.vectorSearch("documents", "by_embedding", { vector: queryEmb.data[0].embedding, limit: 10 });`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
