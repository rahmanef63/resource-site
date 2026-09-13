import { ALL_KINDS, DEFAULT_COPY, DEFAULT_KIND_LABELS } from "./defaults";
import type {
  KindLabelMap,
  LibraryCopy,
  LibraryKind,
  LibraryRow,
} from "./types";

export type LibraryKindFilter = LibraryKind | "all";
export type LibraryVideoSource =
  | { kind: "youtube"; src: string }
  | { kind: "vimeo"; src: string }
  | { kind: "native"; src: string };

export function resolveLibraryCopy(copy?: Partial<LibraryCopy>): LibraryCopy {
  return { ...DEFAULT_COPY, ...copy };
}

export function resolveKindLabels(labels?: KindLabelMap): KindLabelMap {
  return { ...DEFAULT_KIND_LABELS, ...labels };
}

export function collectLibraryTools(items: LibraryRow[]): string[] {
  const tools = new Set<string>();
  for (const item of items) for (const tool of item.tools ?? []) tools.add(tool);
  return Array.from(tools).sort((a, b) => a.localeCompare(b));
}

export function filterLibraryItems(
  items: LibraryRow[],
  kind: LibraryKindFilter,
  tool: string,
): LibraryRow[] {
  return items.filter((item) => {
    if (kind !== "all" && item.kind !== kind) return false;
    if (tool && !(item.tools ?? []).includes(tool)) return false;
    return true;
  });
}

export function libraryVideoSource(url: string | undefined): LibraryVideoSource | null {
  if (!url) return null;
  const youtube = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)?.[1];
  if (youtube) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${youtube}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) return { kind: "vimeo", src: `https://player.vimeo.com/video/${vimeo}` };
  return { kind: "native", src: url };
}

export function formatLibraryFileSize(bytes: number | undefined): string {
  return bytes ? `${Math.round(bytes / 1024)} KB` : "";
}

export function optimisticVote(count: number, voted: boolean): { count: number; voted: boolean } {
  return {
    count: voted ? Math.max(0, count - 1) : count + 1,
    voted: !voted,
  };
}

export function settleVote(
  previousCount: number,
  previousVoted: boolean,
  nextVoted: boolean,
): { count: number; voted: boolean } {
  const delta = Number(nextVoted) - Number(previousVoted);
  return { count: Math.max(0, previousCount + delta), voted: nextVoted };
}

export { ALL_KINDS };
