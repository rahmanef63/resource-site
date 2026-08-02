import { DocsLoadingSkeleton } from "@/components/site/docs-loading-skeleton";

/** Tour acts render live previews — override the parent (docs) text-shaped
 *  skeleton with the preview shape so the transition matches. */
export default function Loading() {
  return <DocsLoadingSkeleton preview />;
}
