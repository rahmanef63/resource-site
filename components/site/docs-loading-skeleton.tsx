import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSkeleton } from "@/features/feedback-states";

interface Props {
  /** Show the docs-shell tab strip placeholder. Off for simple text
   *  pages (changelog, stack), on for slice/layout detail. */
  tabs?: boolean;
  /** Show the preview iframe placeholder. Pairs with `tabs`. */
  preview?: boolean;
}

/**
 * Shared skeleton for docs routes. Mirrors the docs-shell layout so
 * the transition between routes feels weightless — title strip,
 * optional tab bar, optional iframe block. Mount via per-route
 * `loading.tsx` so Next.js streams it instantly on click before the
 * RSC payload arrives.
 */
export function DocsLoadingSkeleton({ tabs = false, preview = false }: Props = {}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-background/60 px-4 py-3">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </header>

      {tabs ? (
        <div className="flex items-center gap-1 border-b px-4 py-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <span className="ml-auto" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden bg-background">
        {preview ? (
          <div className="flex h-full items-center justify-center p-6">
            <Skeleton className="h-full w-full max-w-5xl rounded-lg" />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl p-6 sm:p-8">
            {/* Body shape comes from the loading-states slice (SSOT) —
                this file only keeps the docs-shell chrome strips. */}
            <LoadingSkeleton kind="page" />
          </div>
        )}
      </div>
    </div>
  );
}
