import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChangelogFeedSection } from "@/features/changelog-feed";
import { releases } from "@/lib/content/changelog";
import { sanitizeEntries } from "@/lib/content/changelog/sanitize";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Changelog",
  description: "Release history for the Rahman Resources CLI + MCP + slices.",
};

const PAGE_SIZE = 10;

/**
 * Dogfood — `/changelog` consumes the canonical `changelog-feed` slice.
 * Paginated: release data lives in `lib/content/changelog/part-*.ts` (split
 * by line budget), concatenated by the barrel. The page-reading part is
 * wrapped in <Suspense> so `searchParams` stays cacheComponents-safe.
 */
export default function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ChangelogPaged searchParams={searchParams} />
    </Suspense>
  );
}

async function ChangelogPaged({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const totalPages = Math.max(1, Math.ceil(releases.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const entries = sanitizeEntries(releases.slice(start, start + PAGE_SIZE));

  return (
    <>
      <ChangelogFeedSection
        eyebrow="Release notes"
        title="Changelog"
        subtitle={`What changed in each rr release — page ${page} of ${totalPages}. Full prose history in CHANGELOG.md.`}
        entries={entries}
        sortDescending
        layout="timeline"
      />
      <Pager page={page} totalPages={totalPages} />
    </>
  );
}

function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => (p <= 1 ? "/changelog" : `/changelog?page=${p}`);

  return (
    <nav
      aria-label="Changelog pages"
      className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 pb-20"
    >
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(page - 1)}>
            <ChevronLeft className="size-4" /> Newer
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-4" /> Newer
        </Button>
      )}

      <span className="text-xs tabular-nums text-muted-foreground">
        Page {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(page + 1)}>
            Older <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Older <ChevronRight className="size-4" />
        </Button>
      )}
    </nav>
  );
}
