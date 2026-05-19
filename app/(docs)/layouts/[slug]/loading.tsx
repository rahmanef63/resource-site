import { DocsLoadingSkeleton } from "@/components/site/docs-loading-skeleton";

/** Layout/template detail uses the same docs-shell — tab strip +
 *  preview iframe. Mirror that shape during RSC streaming so users
 *  don't see the previous page frozen between clicks. */
export default function Loading() {
  return <DocsLoadingSkeleton tabs preview />;
}
