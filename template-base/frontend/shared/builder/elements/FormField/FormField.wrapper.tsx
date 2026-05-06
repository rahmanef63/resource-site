/**
 * FormField Element Wrapper
 * Composite of Label + Input + Helper Text
 */

import { createElement } from "../utils/elementFactory"
import { textProp, booleanProp, selectProp } from "@/frontend/shared/ui"
import type { ElementWrapper } from "@/frontend/shared/foundation"

export interface FormFieldProps {
  label?: string
  inputType?: string
  placeholder?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
}

export const FormFieldWrapper: ElementWrapper<FormFieldProps> = createElement<FormFieldProps>({
  id: "form-field",
  name: "FormField",
  displayName: "Form Field",
  description: "A complete form field with label, input, and helper text",
  category: "forms",

  structure: {
    type: "element",
    element: "form-field",
    children: [
      {
        type: "component",
        component: "label",
        props: { children: "{{label}}" },
      },
      {
        type: "component",
        component: "input",
        props: {
          type: "{{inputType}}",
          placeholder: "{{placeholder}}",
          required: "{{required}}",
          disabled: "{{disabled}}",
        },
      },
      {
        type: "component",
        component: "text",
        props: {
          content: "{{helperText}}",
          size: "sm",
          color: "gray-600",
        },
      },
    ],
    layout: {
      display: "flex",
      flexDirection: "column",
      gap: "2",
    },
  },

  defaults: {
    label: "Field Label",
    inputType: "text",
    placeholder: "Enter value...",
    helperText: "Helper text",
    required: false,
    disabled: false,
  },

  props: {
    label: textProp("Label", "Field Label"),
    inputType: selectProp(
      "Input Type",
      ["text", "email", "password", "number", "tel", "url"],
      "text"
    ),
    placeholder: textProp("Placeholder", "Enter value..."),
    helperText: textProp("Helper Text", "Helper text"),
    required: booleanProp("Required", false),
    disabled: booleanProp("Disabled", false),
  },

  icon: "FormInput",
  tags: ["form", "field", "input", "label"],

  metadata: {
    version: "1.0.0",
    category: "forms",
    description: "Composite element combining Label, Input, and helper text",
  },
})

export default FormFieldWrapper
