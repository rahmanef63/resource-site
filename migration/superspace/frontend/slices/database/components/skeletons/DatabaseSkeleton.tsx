import { Skeleton } from "@/components/ui/skeleton";

export function DatabaseSidebarSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      {/* Create button skeleton */}
      <Skeleton className="h-9 w-full rounded-md" />
      
      {/* Database list skeleton */}
      <div className="flex flex-col gap-1 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md p-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatabaseHeaderSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Skeleton className="size-10 rounded-md" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      
      {/* Toolbar section */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function DatabaseTableSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Info bar */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-2">
        <Skeleton className="h-3.5 w-3.5 rounded" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      
      {/* Table */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          {/* Data rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DatabaseContentSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <DatabaseHeaderSkeleton />
      <DatabaseTableSkeleton />
    </div>
  );
}

export function DatabasePageSkeleton() {
  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border">
        <DatabaseSidebarSkeleton />
      </div>
      <div className="flex-1">
        <DatabaseContentSkeleton />
      </div>
    </div>
  );
}
