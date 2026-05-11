/**
 * Command Menu (⌘K) slice — facade over the canonical implementation at
 * `frontend/shared/foundation/utils/system/command-menu/`.
 *
 * Kept as a top-level slice so the registry / builder / CLI can list it
 * alongside other features. The facade lets consumers use one stable path.
 */

export {
  CommandMenu,
  CommandMenuTrigger,
  KeyboardShortcutsDialog,
  type CommandAction,
  type CommandMenuProps,
} from "@/frontend/shared/foundation/utils/system/command-menu";
