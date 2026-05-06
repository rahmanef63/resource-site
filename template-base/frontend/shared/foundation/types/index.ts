/**
 * Shared Types Index
 * Central export for all type definitions
 */

// Core types
export * from "./core"

// JSON Schema types
export * from "./json-schema"

// Registry types
export * from "./registry"

// Menu types
export * from "./menu"

// Conversion types
export type {
  TypeScriptConversionOptions,
  JSONConversionOptions,
  ConversionMetadata,
  IJSONConverter,
  ITypeScriptConverter,
  ISchemaConverter,
  ConversionError,
  ConversionErrorType,
  ConversionWarning,
  ConversionWarningType,
  ASTNode,
  SourceLocation,
  Position,
  JSXElement,
  JSXOpeningElement,
  JSXClosingElement,
  JSXAttribute,
  JSXAttributeValue,
  JSXIdentifier,
  JSXMemberExpression,
  JSXText,
  JSXExpressionContainer,
  Literal,
  ConversionContext,
} from "./conversion"
export {
  defaultConversionOptions,
  createConversionContext,
} from "./conversion"

// Error types
export * from "./errors"

// Manifest types
export * from "./manifest"

// Universal Database types
export * from "./universal-database"

// Re-export commonly used types for convenience
export type {
  // Core
  BaseNode,
  AnyNode,
  AnyWrapper,
  AnyJSON,
  NodeLevel,
  NodeType,
  ComponentNode,
  ElementNode,
  BlockNode,
  SectionNode,
  TemplateNode,
  FlowNode,
  GroupNode,
  ComponentInstance,
  ComponentDefinition,

  // Wrappers
  ComponentWrapper,
  ElementWrapper,
  BlockWrapper,
  SectionWrapper,
  TemplateWrapper,
  FlowWrapper,

  // Props
  PropDefinition,
  PropDefinitions,
  PropType,

  // Metadata
  NodeMetadata,

  // Layout
  LayoutConfig,
  RouteConfig,

} from "./core"

export type {
  // Registry
  IRegistry,
  RegistryEntry,
  RegistryConfig,
} from "./registry"

export type {
  // Conversion
  ConversionOptions,
  ConversionResult,
  IConverter,
} from "./conversion"

export type {
  // JSON
  ComponentJSONType as ComponentJSON,
  ElementJSONType as ElementJSON,
  BlockJSONType as BlockJSON,
  SectionJSONType as SectionJSON,
  TemplateJSONType as TemplateJSON,
  FlowJSONType as FlowJSON,
  ExportSchemaV1Type as ExportSchema,
} from "./json-schema"

export type {
  Result,
} from "./errors"
