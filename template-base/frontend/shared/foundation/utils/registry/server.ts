/**
 * Server-Side Only Registry Utilities
 * 
 * This file exports utilities that use Node.js modules (fs, path, etc.)
 * and should ONLY be imported in server-side code.
 * 
 * DO NOT import from this file in client-side components!
 */

export * from "./RegistryLoader"

export {
  RegistryLoader,
  loadRegistry,
  loadRegistryFrom,
} from "./RegistryLoader"
