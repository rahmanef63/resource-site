import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * Shared skeleton shapes — drop-in `loading` fallback for next/dynamic
 * or Suspense boundaries. Theme-token driven (bg-muted), respects
 * prefers-reduced-motion via Tailwind's animate-pulse variant.
 */

export function SkeletonCarousel({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full aspect-[16/10] border-2 border-foreground rounded-lg bg-card overflow-hidden", className)}>
      <Skeleton className="absolute inset-0 rounded-none" />
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("border-2 border-foreground rounded-lg bg-card p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <Skeleton className="size-10 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonGridTile({ className }: { className?: string }) {
  return (
    <div className={cn("border-2 border-foreground rounded-lg bg-card overflow-hidden", className)}>
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  cols = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  className,
}: {
  count?: number;
  cols?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", cols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonGridTile key={i} />
      ))}
    </div>
  );
}

export function SkeletonInspector() {
  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l-2 border-border bg-background/60 p-4 space-y-4">
      <SkeletonCard />
      <div className="grid grid-cols-2 gap-2">
        <SkeletonCard className="p-3 space-y-2" />
        <SkeletonCard className="p-3 space-y-2" />
      </div>
      <div className="border-2 border-foreground rounded-lg bg-card p-3 space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </aside>
  );
}

export function SkeletonFormField({ className, lines = 2 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function SkeletonPalette() {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-foreground/50 p-4 pt-[15vh]">
      <div className="w-full max-w-lg border-2 border-foreground rounded-lg shadow-lg bg-background p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetailPage() {
  return (
    <div className="space-y-10 px-6 py-10 lg:px-16 lg:py-16">
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-3/4 max-w-lg" />
      </div>
      <SkeletonCarousel />
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
