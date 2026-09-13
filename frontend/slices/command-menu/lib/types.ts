/** React-facing command-menu contracts. Portable data/state semantics live in
 * `./core`; only render slots (`icon`, `trailing`) are React-specific here. */

import type { ReactNode } from "react";
import type {
  CommandGroupBase,
  CommandItemBase,
  SearchBindingsBase,
  SearchHitBase,
} from "./core";

export {
  DEFAULT_PALETTE_LABELS,
  DEFAULT_SEARCH_LABELS,
  type CommandPaletteLabels,
  type SearchModalLabels,
} from "./core";

export type CommandItem = CommandItemBase<ReactNode, ReactNode>;
export type CommandGroup = CommandGroupBase<CommandItem>;
export type SearchHit = SearchHitBase<ReactNode>;
export type SearchModalBindings = SearchBindingsBase<SearchHit>;
