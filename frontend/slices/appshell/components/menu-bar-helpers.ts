// execCommand is deprecated but the only zero-dep clipboard driver from a menu.
export function exec(cmd: string) {
  try {
    document.execCommand(cmd);
  } catch {
    /* no-op in read-only contexts; the ⌘ label is the real affordance */
  }
}

// Edit menu rows — execCommand drives the focused selection; `sep` = divider.
export const EDIT_ITEMS: { cmd: string; label: string; key: string; sep?: boolean }[] = [
  { cmd: "cut", label: "Cut", key: "⌘X" },
  { cmd: "copy", label: "Copy", key: "⌘C" },
  { cmd: "paste", label: "Paste", key: "⌘V" },
  { cmd: "selectAll", label: "Select All", key: "⌘A", sep: true },
];
