"use client";

import {
  EmptyState,
  type EmptyStateKind,
} from "@/features/empty-states";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

const KINDS: { kind: EmptyStateKind; hint: string; primary: string; secondary?: string }[] = [
  { kind: "404", hint: "Page not found", primary: "Back home", secondary: "Contact support" },
  { kind: "500", hint: "Server error", primary: "Try again" },
  { kind: "403", hint: "Access denied", primary: "Request access", secondary: "Back home" },
  { kind: "no-results", hint: "Empty search result", primary: "Clear filters" },
  { kind: "empty-list", hint: "No items yet", primary: "Create item" },
  { kind: "first-use", hint: "Onboarding", primary: "Get started", secondary: "Learn more" },
];

export default function Page() {
  return (
    <SlicePreviewLayout title="Empty States" kind="ui" maxWidth="none">
      <PreviewSection title="All kinds" hint="6 presets composed on shadcn Empty">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {KINDS.map((k) => (
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
