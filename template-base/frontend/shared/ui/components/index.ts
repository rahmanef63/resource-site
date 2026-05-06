/**
 * Components Module Index
 * Exports all component wrappers and utilities
 */

// Registry
export * from "./registry"

// Utilities
export * from "./utils"

// Component wrappers (individual exports)
export * from "./Button"
export * from "./Input"
export * from "./Card"
export * from "./search-bar"
export * from "./ResponsiveDialog"

// Re-export for convenience
export {
  componentRegistry,
  getComponentWrapper,
  getAllComponentWrappers,
  getComponentsByCategory,
  searchComponents,
  registerAllComponents,
} from "./registry"

export {
  createComponent,
  textProp,
  numberProp,
  booleanProp,
  selectProp,
  childrenProp,
} from "./utils"
