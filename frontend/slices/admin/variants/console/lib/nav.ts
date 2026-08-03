import type { ComponentType } from "react"
import * as Icons from "lucide-react"
import type { AdminConsoleSection } from "./sections"

export type SectionIcon = ComponentType<{ className?: string }>

/** lucide name → component, with a square fallback for typos. */
export function sectionIcon(name: string): SectionIcon {
  const I = (Icons as unknown as Record<string, SectionIcon>)[name]
  return I ?? Icons.Square
}

export interface ConsoleNavItem {
  id: string
  label: string
  icon: SectionIcon
  onSelect: () => void
  dock?: boolean
  active?: boolean
}

export interface ConsoleNavGroup {
  id: string
  label: string
  items: ConsoleNavItem[]
}

/**
 * Map visible sections onto nav groups, shaped for the `dashboard-shell` slice's
 * `nav` prop (structural — no import between slices). Use it with
 * `<AdminConsole nav={false}>` so the console's sections drive the ONE app
 * sidebar instead of adding a second rail next to it.
 *
 * `dockCount` sections (in catalog order) are flagged for the mobile dock, and
 * `activeId` marks the current one (button items have no href to match on).
 */
export function sectionsToNav(
  sections: readonly AdminConsoleSection[],
  onSelect: (id: string) => void,
  opts: { activeId?: string; dockCount?: number } = {},
): ConsoleNavGroup[] {
  const { activeId, dockCount = 3 } = opts
  const groups: ConsoleNavGroup[] = []

  sections.forEach((s, i) => {
    const item: ConsoleNavItem = {
      id: s.id,
      label: s.label,
      icon: sectionIcon(s.icon),
      onSelect: () => onSelect(s.id),
      dock: i < dockCount,
      active: activeId === undefined ? undefined : s.id === activeId,
    }
    const group = groups.find((g) => g.id === s.group)
    if (group) group.items.push(item)
    else groups.push({ id: s.group, label: s.group, items: [item] })
  })

  return groups
}
