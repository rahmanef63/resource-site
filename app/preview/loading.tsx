import { Skeleton } from "@/components/ui/skeleton";

/**
 * Instant skeleton for every /preview/** route. Each preview ships a heavy
 * (0.4–1.1MB) client slice chunk; without this the segment paints blank until
 * the chunk loads. Full-bleed to match the edge-to-edge preview shell.
 */
export default function Loading() {
  return (
    <div className="flex h-svh w-full flex-col gap-4 p-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="w-full flex-1 rounded-lg" />
    </div>
  );
}
