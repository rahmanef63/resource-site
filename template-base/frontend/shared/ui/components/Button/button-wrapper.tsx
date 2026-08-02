/**
 * Button Component Wrapper
 * Wraps shadcn/ui Button with metadata for the shared system
 */

import { Button as ShadcnButton } from "@/components/ui/button"
import { createComponent, selectProp, booleanProp, childrenProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

// Button props type from shadcn
export interface ButtonProps {
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon"
  asChild?: boolean
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export const ButtonWrapper: ComponentWrapper<ButtonProps> = createComponent<ButtonProps>({
  id: "button",
  name: "Button",
  displayName: "Button",
  description: "Displays a button or a component that looks like a button",
  category: "buttons",
  component: ShadcnButton,

  defaults: {
    variant: "default",
    size: "default",
    children: "Click me",
    disabled: false,
  },

  props: {
    variant: selectProp(
      "Variant",
      [
        { label: "Default", value: "default" },
        { label: "Primary", value: "primary" },
        { label: "Destructive", value: "destructive" },
        { label: "Outline", value: "outline" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
        { label: "Link", value: "link" },
      ],
      "default"
    ),
    size: selectProp(
      "Size",
      [
        { label: "Default", value: "default" },
        { label: "Extra Small", value: "xs" },
        { label: "Small", value: "sm" },
        { label: "Large", value: "lg" },
        { label: "Icon", value: "icon" },
      ],
      "default"
    ),
    children: {
      ...childrenProp("Click me"),
      description: "Button text content",
    },
    disabled: booleanProp("Disabled", false),
    asChild: {
      ...booleanProp("As Child", false),
      description: "Render as child component using Radix Slot",
    },
  },

  icon: "Button",
  tags: ["button", "action", "cta", "interactive"],

  metadata: {
    version: "1.0.0",
    category: "buttons",
  },
})

// Export for use in registry
export default ButtonWrapper
