/**
 * Badge Component Wrapper
 */

import { Badge as ShadcnBadge } from "@/components/ui/badge"
import { createComponent, selectProp, childrenProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "outline"
  children?: React.ReactNode
  className?: string
}

export const BadgeWrapper: ComponentWrapper<BadgeProps> = createComponent<BadgeProps>({
  id: "badge",
  name: "Badge",
  displayName: "Badge",
  description: "Small status indicator or label",
  category: "data-display",
  component: ShadcnBadge,

  defaults: {
    variant: "default",
    children: "Badge",
  },

  props: {
    variant: selectProp(
      "Variant",
      ["default", "secondary", "destructive", "outline"],
      "default"
    ),
    children: childrenProp("Badge"),
  },

  icon: "Tag",
  tags: ["badge", "tag", "label", "status"],

  metadata: {
    version: "1.0.0",
    category: "data-display",
  },
})

export default BadgeWrapper
