/**
 * Card Component Wrapper
 * Wraps shadcn/ui Card with metadata for the shared system
 */

import { Card as ShadcnCard } from "@/components/ui/card"
import { createComponent, childrenProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface CardProps {
  children?: React.ReactNode
  className?: string
}

export const CardWrapper: ComponentWrapper<CardProps> = createComponent<CardProps>({
  id: "card",
  name: "Card",
  displayName: "Card",
  description: "Displays a card container with shadow and border",
  category: "surfaces",
  component: ShadcnCard,

  defaults: {
    children: "Card content",
  },

  props: {
    children: {
      ...childrenProp("Card content"),
      description: "Card content (can contain CardHeader, CardContent, CardFooter)",
    },
  },

  icon: "Card",
  tags: ["card", "container", "surface", "panel"],

  metadata: {
    version: "1.0.0",
    category: "surfaces",
    description: "Card can contain CardHeader, CardTitle, CardDescription, CardContent, CardFooter sub-components",
  },
})

export default CardWrapper
