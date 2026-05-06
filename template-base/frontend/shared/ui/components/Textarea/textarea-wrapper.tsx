/**
 * Textarea Component Wrapper
 */

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { createComponent, textProp, numberProp, booleanProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface TextareaProps {
  placeholder?: string
  value?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  className?: string
}

export const TextareaWrapper: ComponentWrapper<TextareaProps> = createComponent<TextareaProps>({
  id: "textarea",
  name: "Textarea",
  displayName: "Textarea",
  description: "Multi-line text input field",
  category: "forms",
  component: ShadcnTextarea,

  defaults: {
    placeholder: "Enter text...",
    rows: 4,
    disabled: false,
    required: false,
    readOnly: false,
  },

  props: {
    placeholder: textProp("Placeholder", "Enter text..."),
    value: textProp("Value", ""),
    rows: numberProp("Rows", 4, { min: 1, max: 20 }),
    disabled: booleanProp("Disabled", false),
    required: booleanProp("Required", false),
    readOnly: booleanProp("Read Only", false),
  },

  icon: "FileText",
  tags: ["textarea", "form", "input", "multiline"],

  metadata: {
    version: "1.0.0",
    category: "forms",
  },
})

export default TextareaWrapper
