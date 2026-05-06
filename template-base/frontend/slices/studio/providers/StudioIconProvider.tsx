"use client"

/**
 * Studio Icon Provider
 *
 * Centralizes all icon-related functionality for Studio.
 * Any Studio component imports icons from here — never directly from lucide-react.
 *
 * GitHub: https://github.com/lucide-icons/lucide/tree/main/packages/lucide-react
 * Browse icons: https://lucide.dev/icons
 */

import * as React from "react"
import * as LucideIcons from "lucide-react"
import { IconPicker as SharedIconPicker } from "@/frontend/shared/ui/icons"

// ─── Re-export the shared icon picker for use inside Studio ──────────────────
export { SharedIconPicker as IconPicker }

// ─── All icon names available in Studio (= all Lucide React icons) ───────────
export const STUDIO_ICON_NAMES: string[] = Object.keys(LucideIcons).filter(
  (k) => k !== "createLucideIcon" && /^[A-Z]/.test(k)
)

// ─── Categorized shortlist (used in JSON schema / AI prompts) ─────────────────
export const STUDIO_ICONS_BY_CATEGORY = {
  Layout: ["PanelTop", "Box", "Rows3", "Columns", "Columns2", "Columns3", "LayoutGrid", "MoveHorizontal"],
  Content: ["Type", "Heading", "AlignLeft", "Square", "Text", "FileText"],
  Media: ["Image", "Video", "Music", "Images", "Camera"],
  Navigation: ["Menu", "ChevronRight", "MoreHorizontal", "Link", "ExternalLink"],
  Action: ["MousePointerClick", "Hand", "PointerIcon", "ArrowRight"],
  Data: ["Table", "Database", "BarChart2", "PieChart", "TrendingUp", "Activity"],
  UI: ["Checkbox", "Toggle", "Slider", "Badge", "Tabs", "Accordion", "Dialog"],
  Blocks: ["Layout", "Layers", "LayoutTemplate", "Component"],
} as const

// ─── Resolve icon by name ─────────────────────────────────────────────────────
export function getStudioIcon(name: string): React.ComponentType<any> | null {
  const icon = (LucideIcons as any)[name]
  return typeof icon === "function" ? icon : null
}

// ─── Context (optional — lets child components call getIcon without re-import) ─
interface StudioIconContextValue {
  getIcon: (name: string) => React.ComponentType<any> | null
  iconNames: string[]
}

const StudioIconContext = React.createContext<StudioIconContextValue>({
  getIcon: getStudioIcon,
  iconNames: STUDIO_ICON_NAMES,
})

export function StudioIconProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ getIcon: getStudioIcon, iconNames: STUDIO_ICON_NAMES }),
    []
  )
  return (
    <StudioIconContext.Provider value={value}>
      {children}
    </StudioIconContext.Provider>
  )
}

export function useStudioIcons() {
  return React.useContext(StudioIconContext)
}
