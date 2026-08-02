/**
 * Label Component Wrapper
 */

import { Label as ShadcnLabel } from "@/components/ui/label"
import { createComponent, textProp, childrenProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface LabelProps {
  htmlFor?: string
  children?: React.ReactNode
  className?: string
}

export const LabelWrapper: ComponentWrapper<LabelProps> = createComponent<LabelProps>({
  id: "label",
  name: "Label",
  displayName: "Label",
  description: "Form label component",
  category: "forms",
  component: ShadcnLabel,

  defaults: {
    children: "Label",
  },

  props: {
    htmlFor: textProp("For ID", ""),
    children: childrenProp("Label"),
  },

  icon: "Tag",
  tags: ["label", "form", "input"],

  metadata: {
    version: "1.0.0",
    category: "forms",
  },
})

export default LabelWrapper
