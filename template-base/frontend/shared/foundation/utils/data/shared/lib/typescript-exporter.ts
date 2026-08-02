/**
 * TypeScript Exporter
 * Export nodes to TypeScript/JSX code
 */

import type {
  AnyNode,
  ConversionOptions,
  ConversionResult,
} from "../../../../types"
import { createConversionContext } from "../../../../types"

// ============================================================================
// Export to TypeScript
// ============================================================================

export function exportToTypeScript(
  nodes: AnyNode[],
  componentName: string = "GeneratedComponent",
  options: ConversionOptions = {}
): ConversionResult<string> {
  const context = createConversionContext("nodes", "typescript", options)

  try {
    const tsOptions = options.typescript || {}

    // Generate imports
    const imports = generateImports(nodes, tsOptions)

    // Generate JSX
    const jsx = nodes.map((node) => nodeToJSX(node, context, 1)).join("\n")

    // Generate component
    const code = `
${imports}

export function ${componentName}() {
  return (
    <div>
${jsx}
    </div>
  )
}
`.trim()

    // Format if requested
    const formattedCode = options.pretty !== false ? code : code.replace(/\n\s*/g, "")

    return {
      success: true,
      data: formattedCode,
      errors: context.errors,
      warnings: context.warnings,
      metadata: {
        sourceFormat: "nodes",
        targetFormat: "typescript",
        nodeCount: nodes.length,
        timestamp: Date.now(),
      },
    }
  } catch (error) {
    context.addError({
      message: error instanceof Error ? error.message : String(error),
      details: error,
    })

    return {
      success: false,
      errors: context.errors,
      warnings: context.warnings,
    }
  }
}

// ============================================================================
// Generate Imports
// ============================================================================

function generateImports(nodes: AnyNode[], tsOptions: any): string {
  const components = new Set<string>()

  for (const node of nodes) {
    if (node.type === "component") {
      components.add((node as any).component)
    }
  }

  const importPath = tsOptions.importPath || "@/shared/components"

  if (components.size === 0) {
    return ""
  }

  return `import { ${Array.from(components).join(", ")} } from "${importPath}"`
}

// ============================================================================
// Node to JSX
// ============================================================================

function nodeToJSX(node: AnyNode, context: any, indent: number = 0): string {
  const indentStr = "  ".repeat(indent)

  switch (node.type) {
    case "component": {
      const component = (node as any).component
      const props = (node as any).props || {}
      const children = (node as any).children

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

      const componentName = capitalize(component)

      if (children) {
        return `${indentStr}<${componentName}${propsStr ? " " + propsStr : ""}>${children}</${componentName}>`
      } else {
        return `${indentStr}<${componentName}${propsStr ? " " + propsStr : ""} />`
      }
    }

    case "group": {
      const children = (node as any).children || []
      // Groups don't render, just their children
      return children.map((childId: string) => `${indentStr}  {/* Group child: ${childId} */}`).join("\n")
    }

    default:
      context.addWarning({
        message: `Cannot generate JSX for node type: ${node.type}`,
        nodeId: node.id,
      })
      return `${indentStr}{/* Unsupported node type: ${node.type} */}`
  }
}

// ============================================================================
// Helpers
// ============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
