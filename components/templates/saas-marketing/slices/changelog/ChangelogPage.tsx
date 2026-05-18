"use client";

import {
  ChangelogFeedSection,
  type ChangelogEntry as SliceEntry,
  type ChangelogKind,
} from "@/features/changelog-feed";
import { useChangelog } from "../../shared/store";

/**
 * Hybrid wrapper: reads live entries via useChangelog() and feeds the
 * canonical ChangelogFeedSection slice (DRY+SSOT). Admin edits propagate
 * via createTemplateStore BroadcastChannel.
 */
const KIND_MAP: Record<string, ChangelogKind> = {
  feature: "feature",
  fix: "fix",
  chore: "chore",
};

export function ChangelogPage() {
  const entries = useChangelog();
  const items: SliceEntry[] = entries.map((e) => ({
    id: e.id,
    version: e.version,
    date: e.date,
    kind: KIND_MAP[e.kind] ?? "chore",
    title: e.title,
    body: e.body,
  }));
  return (
    <ChangelogFeedSection
      eyebrow="Changelog"
      title="What's shipped"
      subtitle="Every release, in reverse chronological order."
      entries={items}
      layout="timeline"
      className="!px-6"
    />
  );
}
