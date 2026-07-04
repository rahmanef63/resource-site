import {
  LoadingSkeleton,
  LoadingState,
  LOADING_KINDS,
  EmptyState,
  type EmptyStateKind,
} from "@/features/feedback-states";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

const EMPTY_KINDS: { kind: EmptyStateKind; hint: string; primary: string; secondary?: string }[] = [
  { kind: "404", hint: "Page not found", primary: "Back home", secondary: "Contact support" },
  { kind: "500", hint: "Server error", primary: "Try again" },
  { kind: "403", hint: "Access denied", primary: "Request access", secondary: "Back home" },
  { kind: "no-results", hint: "Empty search result", primary: "Clear filters" },
  { kind: "empty-list", hint: "No items yet", primary: "Create item" },
  { kind: "first-use", hint: "Onboarding", primary: "Get started", secondary: "Learn more" },
];

export default function Page() {
  return (
    <SlicePreviewLayout title="Feedback States" kind="ui" maxWidth="none">
      <PreviewSection
        title="loading · LoadingSkeleton — all kinds"
        hint="7 presets composed on shadcn Skeleton"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {LOADING_KINDS.map((kind) => (
            <div key={kind} className="space-y-2">
              <p className="font-mono text-xs text-muted-foreground">
                kind=&quot;{kind}&quot;
              </p>
              <LoadingSkeleton
                kind={kind}
                className={kind === "block" ? "h-32" : undefined}
              />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="loading · LoadingState — spinner variants"
        hint="inline · block · overlay, on shadcn Spinner"
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <p className="text-sm">
            Sync status: <LoadingState variant="inline" label="Refreshing…" />
          </p>
          <LoadingState variant="block" label="Loading workspace…" />
          <div className="relative rounded-lg border p-4">
            <LoadingSkeleton kind="text" />
            <LoadingState variant="overlay" label="Saving…" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="empty · EmptyState — all kinds" hint="6 presets composed on shadcn Empty">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMPTY_KINDS.map((k) => (
            <EmptyState
              key={k.kind}
              kind={k.kind}
              primaryAction={{ label: k.primary }}
              secondaryAction={k.secondary ? { label: k.secondary } : undefined}
              className="h-full"
            />
          ))}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
