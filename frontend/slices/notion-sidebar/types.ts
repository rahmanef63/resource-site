import type { ReactNode } from "react";

/** Lightweight page descriptor the sidebar tree is built from. The host owns
 *  the data; the sidebar only needs these four fields + sibling order (the
 *  array order of `pages`). Fully decoupled from notion-shell's domain types
 *  so the sidebar is reusable on its own. */
export interface NotionSidebarPage {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
}

/** A page flattened into render order with its tree depth. */
export interface FlatPage extends NotionSidebarPage {
  depth: number;
  childCount: number;
}

export interface NotionSidebarProps {
  pages: NotionSidebarPage[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  /** Drag-reorder / reparent. `beforeId` is the sibling the dragged page is
   *  dropped in front of (null = append to the new parent's children). */
  onMove?: (id: string, parentId: string | null, beforeId: string | null) => void;
  className?: string;
  /** Header label above the tree. */
  label?: string;
  /** Display-only icon renderer per row (e.g. `@/features/icon-picker`'s
   *  DynamicIcon). Default renders the icon string as text (emoji). */
  renderIcon?: (icon: string, className?: string) => ReactNode;
  /** Optional icon PICKER wrapper — wrap the row icon so clicking it opens a
   *  picker (e.g. `@/features/icon-picker`'s IconPickerPopover). When omitted,
   *  the icon is display-only. */
  renderIconPicker?: (args: {
    value: string;
    onChange: (next: string) => void;
    children: ReactNode;
  }) => ReactNode;
  /** Called when a row's icon is changed via the picker. */
  onIconChange?: (id: string, icon: string) => void;
}
