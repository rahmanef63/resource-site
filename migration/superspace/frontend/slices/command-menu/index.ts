export { CommandPalette } from "./components/CommandPalette"
export { CommandGroupList } from "./components/palette/CommandGroups"

export type {
  CommandGroup,
  CommandItem,
  CommandPaletteLabels,
  SearchModalLabels,
} from "./lib/types"
export { DEFAULT_PALETTE_LABELS, DEFAULT_SEARCH_LABELS } from "./lib/types"

export {
  loadHistory,
  saveHistory,
  clearHistory,
  HISTORY_KEY,
  HISTORY_MAX,
  type HistoryEntry,
} from "./lib/cmdkHistory"
