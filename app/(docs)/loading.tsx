import { DocsLoadingSkeleton } from "@/components/site/docs-loading-skeleton";

/** Catch-all loading boundary for every docs route. Per-segment
 *  loading.tsx (slices/[slug], layouts/[slug]) overrides with a
 *  tab+preview shape; plain text routes (changelog, stack, mcp,
 *  installation) fall back to this — title strip + body skeleton. */
export default function Loading() {
  return <DocsLoadingSkeleton />;
}
