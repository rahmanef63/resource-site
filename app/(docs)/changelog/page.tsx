import { ChangelogFeedSection } from "@/features/changelog-feed";
import { releases } from "@/lib/content/changelog";

export const metadata = {
  title: "Changelog",
  description: "Release history for the Rahman Resources CLI + MCP + slices.",
};

/**
 * Dogfood — `/changelog` consumes the canonical `changelog-feed` slice.
 * Same primitive every template ships via `npx rr add changelog-feed`.
 * Source data lives in `lib/content/changelog.ts`; the full prose history
 * is in CHANGELOG.md.
 */
export default function ChangelogPage() {
  return (
    <div className="-mx-4">
      <ChangelogFeedSection
        eyebrow="Release notes"
        title="Changelog"
        subtitle="What changed in each rr release. Full prose history in CHANGELOG.md."
        entries={releases}
        layout="timeline"
      />
    </div>
  );
}
