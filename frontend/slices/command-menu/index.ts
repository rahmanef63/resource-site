// Slice public barrel — renderless command-menu surface (kitab v0.2.0).

export { commandMenuConfig } from "./config";

export { CommandPalette } from "./components/CommandPalette";
export { CommandGroupList } from "./components/palette/CommandGroups";
export { SearchModal } from "./components/SearchModal";

export type {
  CommandGroup,
  CommandItem,
  CommandPaletteLabels,
  SearchModalLabels,
} from "./lib/types";
export { DEFAULT_PALETTE_LABELS, DEFAULT_SEARCH_LABELS } from "./lib/types";

export type { SearchHit, SearchModalBindings } from "./components/SearchModal";

export {
  loadHistory,
  saveHistory,
  clearHistory,
  HISTORY_KEY,
  HISTORY_MAX,
  type HistoryEntry,
} from "./lib/cmdkHistory";
export { commandMenuTools, type CommandMenuCtx } from "./lib/tools";
