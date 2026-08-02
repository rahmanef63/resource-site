"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PageLoading } from "./PageLoading";

// ============================================================================
// GENERIC SKELETONS
// ============================================================================

interface SkeletonContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function SkeletonContainer({ children, className }: SkeletonContainerProps) {
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// SECONDARY SIDEBAR LAYOUT SKELETON
// ============================================================================

export function SecondarySidebarSkeleton() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r bg-muted/30 p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* List Items */}
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-md">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT SKELETON
// ============================================================================

export function ChatSkeleton() {
  return (
    <div className="flex h-full">
      {/* Chat List Sidebar */}
      <div className="w-80 shrink-0 border-r bg-card p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Chat List */}
        <div className="space-y-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Content - Empty State */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ChatDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 border-b p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              i % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            <div className={cn(
              "max-w-[70%] rounded-lg p-3 space-y-2",
              i % 2 === 0 ? "bg-muted" : "bg-primary/10"
            )}>
              <Skeleton className={cn("h-4", i % 3 === 0 ? "w-48" : i % 3 === 1 ? "w-64" : "w-32")} />
              {i % 2 === 0 && <Skeleton className="h-4 w-40" />}
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Composer Bar */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CALLS SKELETON
// ============================================================================

export function CallsSkeleton() {
  return (
    <div className="flex h-full">
      {/* Calls List Sidebar */}
      <div className="w-80 shrink-0 border-r bg-muted/30 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Tabs */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>

        {/* Calls List */}
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Call Detail - Empty State */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DATABASE SKELETON
// ============================================================================

export function DatabaseSkeleton() {
  return (
    <div className="flex h-full">
      {/* Database Sidebar */}
      <div className="w-64 shrink-0 border-r bg-muted/30 p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>

        {/* Search */}
        <Skeleton className="h-9 w-full rounded-md" />

        {/* Table List */}
        <div className="space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-md">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Database Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Table Header */}
        <div className="border-b flex items-center px-4 py-3 gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Table Rows */}
        <div className="flex-1 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-b flex items-center px-4 py-3 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENTS SKELETON
// ============================================================================

export function DocumentsSkeleton() {
  return (
    <div className="flex h-full">
      {/* Document List Sidebar */}
      <div className="w-80 shrink-0 border-r p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>

        {/* Document Tree */}
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-md" style={{ paddingLeft: `${(i % 3) * 12 + 8}px` }}>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Document Editor */}
      <div className="flex-1 flex flex-col p-6">
        {/* Title */}
        <div className="space-y-4 border-b pb-6 mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 flex-1 max-w-md" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Content */}
        <div className="space-y-4 flex-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-4/6" />
          <div className="pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </div>
        </div>
      </div>

      {/* Inspector */}
      <div className="w-80 shrink-0 border-l bg-muted/30 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>

        {/* Metadata */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-12" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GENERIC PAGE SKELETON
// ============================================================================

export function PageSkeleton() {
  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CENTERED LOADING SKELETON
// ============================================================================

export function CenteredLoadingSkeleton({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT
// ============================================================================

export const FeatureSkeletons = {
  Chat: ChatSkeleton,
  ChatDetail: ChatDetailSkeleton,
  Calls: CallsSkeleton,
  Database: DatabaseSkeleton,
  Documents: DocumentsSkeleton,
  Page: PageSkeleton,
  SecondarySidebar: SecondarySidebarSkeleton,
  CenteredLoading: CenteredLoadingSkeleton,
  PageLoading: PageLoading,
};

export * from "./PageLoading";
