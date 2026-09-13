import {
  loadHistory,
  saveHistory,
  type HistoryEntry,
} from "./cmdkHistory";

export interface CommandItemBase<TIcon = unknown, TTrailing = unknown> {
  id: string;
  value: string;
  label: string;
  icon?: TIcon;
  trailing?: TTrailing;
  onSelect: () => void | Promise<void>;
  track?: HistoryEntry;
}

export interface CommandGroupBase<TItem extends CommandItemBase = CommandItemBase> {
  id: string;
  heading: string;
  items: TItem[];
  hideOnQuery?: boolean;
  showOnQueryOnly?: boolean;
}

export interface CommandPaletteLabels {
  placeholder?: string;
  empty?: string;
  recentCommandsHeading?: string;
}

export const DEFAULT_PALETTE_LABELS: Required<CommandPaletteLabels> = {
  placeholder: "Search pages, databases, or run a command…",
  empty: "No results.",
  recentCommandsHeading: "Recent commands",
};

export interface SearchModalLabels {
  searchTitle?: string;
  searchDescription?: string;
  searchPlaceholder?: string;
  emptyHint?: string;
  noResults?: (query: string) => string;
  recentHeading?: string;
  pagesHeading?: string;
  databasesHeading?: string;
  escapeHint?: string;
}

export const DEFAULT_SEARCH_LABELS: Required<SearchModalLabels> = {
  searchTitle: "Search workspace",
  searchDescription: "Search pages and databases by title.",
  searchPlaceholder: "Search pages and databases…",
  emptyHint: "Start typing to search your workspace",
  noResults: (q) => `No results for \"${q}\"`,
  recentHeading: "Recent",
  pagesHeading: "Pages",
  databasesHeading: "Databases",
  escapeHint: "ESC",
};

export interface SearchHitBase<TIcon = unknown> {
  id: string;
  title: string;
  subtitle?: string;
  icon?: TIcon;
}

export interface SearchBindingsBase<THit extends SearchHitBase = SearchHitBase> {
  isLoading: boolean;
  pages: THit[];
  databases: THit[];
  recents: THit[];
  onQueryChange: (q: string) => void;
  onSelectPage: (hit: THit) => void;
  onSelectDatabase: (hit: THit) => void;
}

export function resolvePaletteLabels(
  labels?: CommandPaletteLabels,
): Required<CommandPaletteLabels> {
  return { ...DEFAULT_PALETTE_LABELS, ...labels };
}

export function resolveSearchLabels(
  labels?: SearchModalLabels,
): Required<SearchModalLabels> {
  return { ...DEFAULT_SEARCH_LABELS, ...labels };
}

export function isCommandMenuHotkey(event: {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
}): boolean {
  return Boolean(event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
}

export function visibleCommandGroups<TItem extends CommandItemBase>(
  groups: CommandGroupBase<TItem>[],
  query: string,
): CommandGroupBase<TItem>[] {
  const hasQuery = query.trim().length > 0;
  return groups.filter((group) => {
    if (group.items.length === 0) return false;
    if (hasQuery && group.hideOnQuery) return false;
    if (!hasQuery && group.showOnQueryOnly) return false;
    return true;
  });
}

export function filterCommandGroups<TItem extends CommandItemBase>(
  groups: CommandGroupBase<TItem>[],
  query: string,
): CommandGroupBase<TItem>[] {
  const visible = visibleCommandGroups(groups, query);
  const q = query.trim().toLowerCase();
  if (!q) return visible;
  return visible
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        `${item.label} ${item.value}`.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export async function runCommandSelection(
  item: CommandItemBase,
  options: {
    close: () => void;
    storage?: Storage | null;
  },
): Promise<HistoryEntry[]> {
  options.close();
  const history = item.track
    ? saveHistory(item.track, options.storage)
    : loadHistory(options.storage);
  await item.onSelect();
  return history;
}

export function searchView<THit extends SearchHitBase>(
  query: string,
  bindings: SearchBindingsBase<THit>,
): {
  recent: THit[];
  totalHits: number;
  showEmptyHint: boolean;
  showNoResults: boolean;
} {
  const hasQuery = query.trim().length > 0;
  const totalHits = bindings.pages.length + bindings.databases.length;
  const recent = hasQuery ? [] : bindings.recents.slice(0, 5);
  return {
    recent,
    totalHits,
    showEmptyHint: !hasQuery && recent.length === 0,
    showNoResults: hasQuery && !bindings.isLoading && totalHits === 0,
  };
}
