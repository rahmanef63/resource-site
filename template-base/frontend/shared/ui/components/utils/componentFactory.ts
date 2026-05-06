/**
 * Component Factory
 * Utilities for creating component wrappers
 */

import { z } from "zod"
import type { ComponentType } from "react"
import type {
  ComponentWrapper,
  ComponentCategory,
  PropDefinitions,
  PropDefinition,
  ComponentJSON,
  NodeMetadata,
} from "@/frontend/shared/foundation/types"
// TODO: validateProps causes issues with client components importing server-side code
// import { validateProps } from '@/frontend/shared/foundation/utils'

// ============================================================================
// Factory Options
// ============================================================================

export interface CreateComponentOptions<TProps = any> {
  id: string
  name: string
  displayName?: string
  description?: string
  category: ComponentCategory
  component: ComponentType<TProps>
  defaults: Partial<TProps>
  props: PropDefinitions
  icon?: string | ComponentType
  previewImage?: string
  tags?: string[]
  metadata?: NodeMetadata

  // Custom conversion methods (optional)
  fromJSON?: (json: any) => TProps
  toJSON?: (props: TProps) => ComponentJSON
  toTypeScript?: (props: TProps, children?: string) => string

  // Custom validation (optional)
  validate?: (props: any) => TProps
}

// ============================================================================
// Component Factory
// ============================================================================

export function createComponent<TProps = any>(
  options: CreateComponentOptions<TProps>
): ComponentWrapper<TProps> {
  const {
    id,
    name,
    displayName,
    description,
    category,
    component,
    defaults,
    props: propDefinitions,
    icon,
    previewImage,
    tags,
    metadata,
  } = options

  // Build Zod schema from prop definitions
  const zodSchema = buildZodSchema(propDefinitions, defaults)

  // Default fromJSON
  const fromJSON: (json: any) => TProps =
    options.fromJSON ??
    ((json: any) => {
      const props = json.props || json
      return zodSchema.parse(props) as TProps
    })

  // Default toJSON
  const toJSON = options.toJSON || ((props: TProps) => {
    return {
      type: "component" as const,
      component: id,
      props: compactProps(props as any, defaults),
      children: (props as any).children,
    }
  })

  // Default toTypeScript
  const toTypeScript = options.toTypeScript || ((props: TProps, children?: string) => {
    return generateTypeScriptCode(name, props as any, children)
  })

  // Default validate
  const validate: (props: any) => TProps =
    options.validate ??
    ((props: any) => {
      // TODO: validateProps causes issues - commented out temporarily
      // validateProps(props, propDefinitions, id)
      return zodSchema.parse(props) as TProps
    })

  return {
    id,
    type: "component",
    name,
    displayName: displayName || name,
    description,
    category,
    component,
    defaults,
    props: propDefinitions,
    icon,
    previewImage,
    tags,
    metadata,
    fromJSON,
    toJSON,
    toTypeScript,
    validate,
  }
}

// ============================================================================
// Prop Definition Helpers
// ============================================================================

export function textProp(label: string, defaultValue?: string): PropDefinition<string> {
  return {
    type: "text",
    label,
    default: defaultValue || "",
  }
}

export function numberProp(
  label: string,
  defaultValue: number = 0,
  options?: { min?: number; max?: number; step?: number }
): PropDefinition<number> {
  return {
    type: "number",
    label,
    default: defaultValue,
    min: options?.min,
    max: options?.max,
    step: options?.step,
  }
}

export function booleanProp(label: string, defaultValue: boolean = false): PropDefinition<boolean> {
  return {
    type: "boolean",
    label,
    default: defaultValue,
  }
}

export function selectProp<T extends string>(
  label: string,
  options: Array<T | { label: string; value: T }>,
  defaultValue?: T
): PropDefinition<T> {
  return {
    type: "select",
    label,
    options: options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    ),
    default: defaultValue || (typeof options[0] === "string" ? options[0] : options[0].value),
  }
}

export function multiSelectProp<T extends string>(
  label: string,
  options: Array<T | { label: string; value: T }>,
  defaultValue: T[] = []
): PropDefinition<T[]> {
  return {
    type: "multi-select",
    label,
    options: options.map((opt) =>
      typeof opt === "string" ? { label: opt, value: opt } : opt
    ),
    default: defaultValue,
  }
}

export function colorProp(label: string, defaultValue: string = "#000000"): PropDefinition<string> {
  return {
    type: "color",
    label,
    default: defaultValue,
  }
}

export function imageProp(label: string, defaultValue?: string): PropDefinition<string> {
  return {
    type: "image",
    label,
    default: defaultValue || "",
  }
}

export function iconProp(label: string, defaultValue?: string): PropDefinition<string> {
  return {
    type: "icon",
    label,
    default: defaultValue || "",
  }
}

export function sliderProp(
  label: string,
  defaultValue: number = 0,
  min: number = 0,
  max: number = 100,
  step: number = 1
): PropDefinition<number> {
  return {
    type: "slider",
    label,
    default: defaultValue,
    min,
    max,
    step,
  }
}

// ============================================================================
// Prop Definition Groups
// ============================================================================

export function childrenProp(defaultValue?: string): PropDefinition {
  return {
    type: "text",
    label: "Children",
    default: defaultValue || "",
    multiline: true,
  }
}

export function classNameProp(): PropDefinition<string> {
  return {
    type: "text",
    label: "Class Name",
    description: "Additional CSS classes",
    default: "",
  }
}

export function layoutProps(): PropDefinitions {
  return {
    display: selectProp("Display", ["flex", "block", "inline-block", "grid"], "flex"),
    flexDirection: selectProp("Flex Direction", ["row", "column", "row-reverse", "column-reverse"], "row"),
    justifyContent: selectProp(
      "Justify Content",
      ["start", "center", "end", "between", "around", "evenly"],
      "start"
    ),
    alignItems: selectProp("Align Items", ["start", "center", "end", "stretch", "baseline"], "start"),
    gap: textProp("Gap", "0"),
    padding: textProp("Padding", "0"),
    margin: textProp("Margin", "0"),
  }
}

export function sizeProps(): PropDefinitions {
  return {
    width: textProp("Width", "auto"),
    height: textProp("Height", "auto"),
    minWidth: textProp("Min Width", "0"),
    minHeight: textProp("Min Height", "0"),
    maxWidth: textProp("Max Width", "none"),
    maxHeight: textProp("Max Height", "none"),
  }
}

export function spacingProps(): PropDefinitions {
  return {
    padding: textProp("Padding", "0"),
    paddingTop: textProp("Padding Top", "0"),
    paddingRight: textProp("Padding Right", "0"),
    paddingBottom: textProp("Padding Bottom", "0"),
    paddingLeft: textProp("Padding Left", "0"),
    margin: textProp("Margin", "0"),
    marginTop: textProp("Margin Top", "0"),
    marginRight: textProp("Margin Right", "0"),
    marginBottom: textProp("Margin Bottom", "0"),
    marginLeft: textProp("Margin Left", "0"),
  }
}

// ============================================================================
// Helpers
// ============================================================================

function buildZodSchema(propDefinitions: PropDefinitions, defaults: any): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [key, definition] of Object.entries(propDefinitions)) {
    let schema: z.ZodTypeAny

    switch (definition.type) {
      case "text":
      case "richtext":
      case "code":
      case "color":
      case "image":
      case "icon":
        schema = z.string()
        if (definition.maxLength) {
          schema = (schema as z.ZodString).max(definition.maxLength)
        }
        break

      case "number":
      case "slider":
        schema = z.number()
        if (definition.min !== undefined) {
          schema = (schema as z.ZodNumber).min(definition.min)
        }
        if (definition.max !== undefined) {
          schema = (schema as z.ZodNumber).max(definition.max)
        }
        break

      case "boolean":
        schema = z.boolean()
        break

      case "select":
        if (definition.options && definition.options.length > 0) {
          const values = definition.options.map((opt) =>
            typeof opt === "object" ? opt.value : opt
          )
          schema = z.enum(values as [string, ...string[]])
        } else {
          schema = z.string()
        }
        break

      case "multi-select":
        schema = z.array(z.string())
        break

      case "date":
        schema = z.union([z.date(), z.string()])
        break

      case "json":
        schema = z.any()
        break

      default:
        schema = z.any()
    }

    // Make optional if not required
    if (!definition.required) {
      schema = schema.optional().default(definition.default ?? defaults[key])
    }

    shape[key] = schema
  }

  return z.object(shape)
}

function compactProps(props: Record<string, any>, defaults: any): Record<string, any> {
  const compacted: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // Skip if value equals default
    if (defaults[key] !== undefined && value === defaults[key]) {
      continue
    }

    // Skip undefined/null
    if (value === undefined || value === null) {
      continue
    }

    // Skip empty strings/arrays/objects
    if (value === "" || (Array.isArray(value) && value.length === 0)) {
      continue
    }

    compacted[key] = value
  }

  return compacted
}

function generateTypeScriptCode(
  componentName: string,
  props: Record<string, any>,
  children?: string
): string {
  const propsStr = Object.entries(props)
    .filter(([key]) => key !== "children")
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`
      } else if (typeof value === "boolean") {
        return value ? key : `${key}={false}`
      } else {
        return `${key}={${JSON.stringify(value)}}`
      }
    })
    .join(" ")

  const childContent = children || props.children || ""

  if (childContent) {
    return `<${componentName}${propsStr ? " " + propsStr : ""}>${childContent}</${componentName}>`
  } else {
    return `<${componentName}${propsStr ? " " + propsStr : ""} />`
  }
}
