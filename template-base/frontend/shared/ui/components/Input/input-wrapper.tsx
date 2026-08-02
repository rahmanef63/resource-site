/**
 * Input Component Wrapper
 * Wraps shadcn/ui Input with metadata for the shared system
 */

import { Input as ShadcnInput } from "@/components/ui/input"
import { createComponent, textProp, selectProp, booleanProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "time" | "datetime-local" | "month" | "week"
  placeholder?: string
  value?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  className?: string
}

export const InputWrapper: ComponentWrapper<InputProps> = createComponent<InputProps>({
  id: "input",
  name: "Input",
  displayName: "Input",
  description: "Displays a form input field for text entry",
  category: "forms",
  component: ShadcnInput,

  defaults: {
    type: "text",
    placeholder: "Enter text...",
    disabled: false,
    required: false,
    readOnly: false,
  },

  props: {
    type: selectProp(
      "Type",
      [
        { label: "Text", value: "text" },
        { label: "Email", value: "email" },
        { label: "Password", value: "password" },
        { label: "Number", value: "number" },
        { label: "Telephone", value: "tel" },
        { label: "URL", value: "url" },
        { label: "Search", value: "search" },
        { label: "Date", value: "date" },
        { label: "Time", value: "time" },
        { label: "DateTime", value: "datetime-local" },
        { label: "Month", value: "month" },
        { label: "Week", value: "week" },
      ],
      "text"
    ),
    placeholder: {
      ...textProp("Placeholder", "Enter text..."),
      description: "Placeholder text shown when input is empty",
    },
    value: {
      ...textProp("Value", ""),
      description: "Input value",
    },
    disabled: booleanProp("Disabled", false),
    required: booleanProp("Required", false),
    readOnly: booleanProp("Read Only", false),
  },

  icon: "Input",
  tags: ["input", "form", "text", "field"],

  metadata: {
    version: "1.0.0",
    category: "forms",
  },
})

export default InputWrapper
