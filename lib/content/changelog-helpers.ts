import { releases } from "./changelog";
import type {
  ChangelogBullet,
  ChangelogEntry,
} from "@/features/changelog-feed";

/** Entries per /changelog page — SSOT shared by the route's paginator
 *  and every deep link that targets an entry anchor. */
export const CHANGELOG_PAGE_SIZE = 10;

export interface ChangelogRef {
  /** Release entry id (e.g. "1.7.0" or "AN"). */
  releaseId: string;
  /** Release version label. */
  version: string;
  /** Release date ms epoch. */
  date: number;
  /** Bullet text from the changelog (caller can show as hover tooltip). */
  bulletText: string;
  /** 1-based /changelog page the entry renders on — anchors on other
   *  pages never scroll, so deep links must carry ?page=N. */
  page: number;
}

/** Deep link to a changelog entry that actually lands on it. */
export function changelogHref(ref: Pick<ChangelogRef, "releaseId" | "page">): string {
  const query = ref.page > 1 ? `?page=${ref.page}` : "";
  return `/changelog${query}#${ref.releaseId}`;
}

function bulletText(b: ChangelogBullet): string {
  return typeof b === "string" ? b : b.text;
}

/**
 * Latest changelog reference per `${kind}:${slug}`, precomputed ONCE at module
 * load. releases are newest-first, so the first bullet seen for a key is its
 * latest reference. Turns getLatestUpdate from O(releases×bullets) per call
 * (~123 badges × 163 releases per page) into O(1). See docs/perf-audit.md.
 */
const latestRefByKey: Map<string, ChangelogRef> = (() => {
  const map = new Map<string, ChangelogRef>();
  for (let i = 0; i < releases.length; i++) {
    const entry = releases[i];
    const bullets: ChangelogBullet[] = [
      ...(entry.bullets ?? []),
      ...((entry.groups ?? []).flatMap((g) => g.bullets)),
    ];
    for (const b of bullets) {
      if (typeof b === "string" || !b.slug) continue;
      const key = `${b.kind ?? "slice"}:${b.slug}`;
      if (map.has(key)) continue; // first match wins (newest-first order)
      map.set(key, {
        releaseId: entry.id,
        version: entry.version,
        date: entry.date,
        bulletText: bulletText(b),
        page: Math.floor(i / CHANGELOG_PAGE_SIZE) + 1,
      });
    }
  }
  return map;
})();

/**
 * Latest changelog entry that references the given slug + kind. Used to
 * surface "Updated Nd ago" badges on catalog cards + detail page headers.
 * Returns null when nothing references the slug yet.
 */
export function getLatestUpdate(
  slug: string,
  kind: "slice" | "template",
): ChangelogRef | null {
  return latestRefByKey.get(`${kind}:${slug}`) ?? null;
}

/** Human-readable "3d ago" / "2w ago" / "Sep 14" for a ms epoch. */
export function formatRelative(ms: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ms);
  const day = 86_400_000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** True when the latest update fell within the last `windowDays` (default 14). */
export function isRecentlyUpdated(
  slug: string,
  kind: "slice" | "template",
  windowDays: number = 14,
): boolean {
  const ref = getLatestUpdate(slug, kind);
  if (!ref) return false;
  return Date.now() - ref.date < windowDays * 86_400_000;
}

export type { ChangelogEntry };
