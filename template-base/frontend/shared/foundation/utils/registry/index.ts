/**
 * Registry Module Index
 * Central export for all registry functionality
 */

export * from "./Registry"
// NOTE: RegistryLoader uses Node.js-only modules (fast-glob, path) 
// It should only be imported server-side: import { RegistryLoader } from './RegistryLoader'
// export * from "./RegistryLoader"
export * from "./RegistryEventEmitter"
export * from "./RegistryCache"
export * from "./command-registry"
export * from "./create-registry"
export * from "./feature-settings-registry"

// Re-export for convenience
export {
  Registry,
  getGlobalRegistry,
  setGlobalRegistry,
  resetGlobalRegistry,
} from "./Registry"

// NOTE: RegistryLoader removed from exports - use direct import for server-side only
// export {
//   RegistryLoader,
//   loadRegistry,
//   loadRegistryFrom,
// } from "./RegistryLoader"

export {
  RegistryEventEmitter,
  createRegistryEvent,
  createRegisterEvent,
  createUnregisterEvent,
  createUpdateEvent,
} from "./RegistryEventEmitter"

export {
  RegistryCache,
  PersistentRegistryCache,
  MemoryRegistryCache,
  getGlobalCache,
  setGlobalCache,
  clearGlobalCache,
} from "./RegistryCache"

// Command registry
export {
  registerCommands,
  unregisterCommands,
  getAllCommands,
  clearCommandRegistry,
} from "./command-registry"
export type { CommandDefinition, CommandGroup } from "./command-registry"

// Create action registry
export {
  registerCreateActions,
  unregisterCreateActions,
  getAllCreateActions,
  clearCreateRegistry,
} from "./create-registry"
export type { CreateAction } from "./create-registry"

// Feature settings registry
export {
  registerFeatureSettings,
  unregisterFeatureSettings,
  getFeatureSettingsBuilder,
  getAllRegisteredFeatures,
  hasFeatureSettings,
  clearFeatureSettingsRegistry,
} from "./feature-settings-registry"


