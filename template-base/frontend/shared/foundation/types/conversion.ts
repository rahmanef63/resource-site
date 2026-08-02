/**
 * Conversion Types
 * For bidirectional conversion between JSON, TypeScript, and node structures
 */

import type { AnyNode, AnyJSON } from "./core"
import type { ExportSchemaV1Type } from "./json-schema"

// ============================================================================
// Conversion Options
// ============================================================================

export interface ConversionOptions {
  // Format options
  pretty?: boolean // Pretty-print JSON/TypeScript
  indent?: number // Indentation spaces
  singleQuote?: boolean // Use single quotes in TS

  // Validation
  validate?: boolean // Validate before conversion
  strict?: boolean // Strict validation

  // Error handling
  throwOnError?: boolean // Throw or return errors
  skipInvalid?: boolean // Skip invalid nodes

  // Optimization
  minify?: boolean // Minify output
  removeDefaults?: boolean // Remove default values
  compactProps?: boolean // Remove empty props

  // Metadata
  includeMetadata?: boolean // Include metadata in output
  includeComments?: boolean // Include comments (TS only)

  // TypeScript specific
  typescript?: TypeScriptConversionOptions

  // JSON specific
  json?: JSONConversionOptions
}

export interface TypeScriptConversionOptions {
  // Import statements
  importStyle?: "named" | "default" | "namespace"
  importPath?: string // Path for component imports
  includeTypes?: boolean // Include TypeScript types

  // Component style
  functional?: boolean // Functional vs class components
  jsx?: boolean // JSX vs React.createElement

  // Code style
  semicolons?: boolean
  trailingComma?: boolean
  arrowParens?: "always" | "avoid"

  // Framework
  framework?: "react" | "vue" | "svelte" | "solid"
}

export interface JSONConversionOptions {
  // Schema version
  schemaVersion?: string

  // Structure
  flat?: boolean // Flat vs nested structure
  includeIds?: boolean // Include node IDs

  // Optimization
  deduplicateProps?: boolean // Deduplicate repeated props
  inlineSmallNodes?: boolean // Inline small nodes
}

export const defaultConversionOptions: ConversionOptions = {
  pretty: true,
  indent: 2,
  singleQuote: false,
  validate: true,
  strict: false,
  throwOnError: false,
  skipInvalid: false,
  minify: false,
  removeDefaults: true,
  compactProps: true,
  includeMetadata: true,
  includeComments: false,

  typescript: {
    importStyle: "named",
    importPath: "@/shared/components",
    includeTypes: false,
    functional: true,
    jsx: true,
    semicolons: false,
    trailingComma: true,
    arrowParens: "avoid",
    framework: "react",
  },

  json: {
    schemaVersion: "1.0.0",
    flat: false,
    includeIds: true,
    deduplicateProps: false,
    inlineSmallNodes: false,
  },
}

// ============================================================================
// Conversion Result
// ============================================================================

export interface ConversionResult<T = any> {
  success: boolean
  data?: T
  errors: ConversionError[]
  warnings: ConversionWarning[]
  metadata?: ConversionMetadata
}

export interface ConversionMetadata {
  sourceFormat: string
  targetFormat: string
  nodeCount?: number
  duration?: number
  timestamp: number
}

// ============================================================================
// Converter Interface
// ============================================================================

export interface IConverter<TInput, TOutput> {
  convert(input: TInput, options?: ConversionOptions): ConversionResult<TOutput>
  validate(input: TInput): boolean
  canConvert(input: any): boolean
}

// ============================================================================
// Specific Converters
// ============================================================================

export interface IJSONConverter {
  // Node -> JSON
  nodeToJSON(node: AnyNode, options?: ConversionOptions): ConversionResult<AnyJSON>
  nodesToJSON(nodes: AnyNode[], options?: ConversionOptions): ConversionResult<AnyJSON[]>

  // JSON -> Node
  jsonToNode(json: AnyJSON, options?: ConversionOptions): ConversionResult<AnyNode>
  jsonToNodes(json: AnyJSON[], options?: ConversionOptions): ConversionResult<AnyNode[]>

  // Schema conversion
  toExportSchema(nodes: AnyNode[], options?: ConversionOptions): ConversionResult<ExportSchemaV1Type>
  fromExportSchema(schema: ExportSchemaV1Type, options?: ConversionOptions): ConversionResult<AnyNode[]>
}

export interface ITypeScriptConverter {
  // Node -> TypeScript
  nodeToTypeScript(node: AnyNode, options?: ConversionOptions): ConversionResult<string>
  nodesToTypeScript(nodes: AnyNode[], options?: ConversionOptions): ConversionResult<string>

  // TypeScript -> Node
  typeScriptToNode(code: string, options?: ConversionOptions): ConversionResult<AnyNode>
  typeScriptToNodes(code: string, options?: ConversionOptions): ConversionResult<AnyNode[]>

  // Component generation
  generateComponent(nodes: AnyNode[], componentName: string, options?: ConversionOptions): ConversionResult<string>
}

export interface ISchemaConverter {
  
  convertCMSSchema(schema: any, options?: ConversionOptions): ConversionResult<ExportSchemaV1Type>

  
  convertDocumentsToSchema(blocks: any, options?: ConversionOptions): ConversionResult<ExportSchemaV1Type>

  
  convertSchemaToDocuments(schema: ExportSchemaV1Type, options?: ConversionOptions): ConversionResult<any>
}

// ============================================================================
// Conversion Errors & Warnings
// ============================================================================

export interface ConversionError {
  type: ConversionErrorType
  message: string
  nodeId?: string
  path?: string
  line?: number
  column?: number
  details?: any
}

export type ConversionErrorType =
  | "validation"
  | "parsing"
  | "conversion"
  | "missing_component"
  | "invalid_props"
  | "circular_reference"
  | "unknown_type"
  | "syntax_error"

export interface ConversionWarning {
  type: ConversionWarningType
  message: string
  nodeId?: string
  path?: string
  suggestion?: string
}

export type ConversionWarningType =
  | "deprecated"
  | "missing_metadata"
  | "default_used"
  | "prop_ignored"
  | "performance"
  | "compatibility"

// ============================================================================
// AST Types (for TypeScript parsing)
// ============================================================================

export interface ASTNode {
  type: string
  start?: number
  end?: number
  loc?: SourceLocation
  [key: string]: any
}

export interface SourceLocation {
  start: Position
  end: Position
}

export interface Position {
  line: number
  column: number
}

export interface JSXElement extends ASTNode {
  type: "JSXElement"
  openingElement: JSXOpeningElement
  closingElement: JSXClosingElement | null
  children: Array<JSXElement | JSXText | JSXExpressionContainer>
}

export interface JSXOpeningElement extends ASTNode {
  type: "JSXOpeningElement"
  name: JSXIdentifier | JSXMemberExpression
  attributes: JSXAttribute[]
  selfClosing: boolean
}

export interface JSXClosingElement extends ASTNode {
  type: "JSXClosingElement"
  name: JSXIdentifier | JSXMemberExpression
}

export interface JSXAttribute extends ASTNode {
  type: "JSXAttribute"
  name: JSXIdentifier
  value: JSXAttributeValue | null
}

export type JSXAttributeValue =
  | Literal
  | JSXExpressionContainer
  | JSXElement

export interface JSXIdentifier extends ASTNode {
  type: "JSXIdentifier"
  name: string
}

export interface JSXMemberExpression extends ASTNode {
  type: "JSXMemberExpression"
  object: JSXMemberExpression | JSXIdentifier
  property: JSXIdentifier
}

export interface JSXText extends ASTNode {
  type: "JSXText"
  value: string
  raw: string
}

export interface JSXExpressionContainer extends ASTNode {
  type: "JSXExpressionContainer"
  expression: ASTNode
}

export interface Literal extends ASTNode {
  type: "Literal"
  value: string | number | boolean | null
  raw: string
}

// ============================================================================
// Conversion Context
// ============================================================================

export interface ConversionContext {
  // Source info
  sourceFormat: string
  targetFormat: string

  // State
  nodeMap: Map<string, AnyNode>
  idCounter: number
  errors: ConversionError[]
  warnings: ConversionWarning[]

  // Options
  options: ConversionOptions

  // Helpers
  generateId: () => string
  addError: (error: Omit<ConversionError, "type"> & { type?: ConversionErrorType }) => void
  addWarning: (warning: Omit<ConversionWarning, "type"> & { type?: ConversionWarningType }) => void
  getNode: (id: string) => AnyNode | undefined
  setNode: (id: string, node: AnyNode) => void
}

// ============================================================================
// Conversion Helpers
// ============================================================================

export function createConversionContext(
  sourceFormat: string,
  targetFormat: string,
  options: ConversionOptions = defaultConversionOptions
): ConversionContext {
  const errors: ConversionError[] = []
  const warnings: ConversionWarning[] = []
  const nodeMap = new Map<string, AnyNode>()
  let idCounter = 0

  return {
    sourceFormat,
    targetFormat,
    nodeMap,
    idCounter,
    errors,
    warnings,
    options,

    generateId() {
      return `node-${++idCounter}`
    },

    addError(error) {
      errors.push({
        type: error.type || "conversion",
        message: error.message,
        nodeId: error.nodeId,
        path: error.path,
        line: error.line,
        column: error.column,
        details: error.details,
      })
    },

    addWarning(warning) {
      warnings.push({
        type: warning.type || "compatibility",
        message: warning.message,
        nodeId: warning.nodeId,
        path: warning.path,
        suggestion: warning.suggestion,
      })
    },

    getNode(id) {
      return nodeMap.get(id)
    },

    setNode(id, node) {
      nodeMap.set(id, node)
    },
  }
}
