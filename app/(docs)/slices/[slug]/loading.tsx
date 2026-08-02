import { DocsLoadingSkeleton } from "@/components/site/docs-loading-skeleton";

/** Streamed instantly on click — before the slice's RSC payload + file
 *  reads complete. Matches the docs-shell tab strip + iframe shape so
 *  the transition feels seamless. */
export default function Loading() {
  return <DocsLoadingSkeleton tabs preview />;
}
