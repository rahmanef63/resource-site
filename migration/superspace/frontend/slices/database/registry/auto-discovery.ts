/**
 * Property Auto-Discovery
 *
 * Automatically registers all property type configurations
 * from the properties/ directory.
 *
 * This enables zero-config property registration - just create a new
 * property folder with config.ts and add it to the configs array below.
 *
 * Note: Next.js doesn't support import.meta.glob, so we use explicit imports.
 *
 * @module frontend/slices/database/registry/auto-discovery
 */

import { propertyRegistry } from "./PropertyRegistry";
import type { PropertyConfig } from "./types";

// Explicitly import all property configurations for Next.js compatibility
import buttonConfig from "../properties/button/config";
import checkboxConfig from "../properties/checkbox/config";
import createdByConfig from "../properties/created_by/config";
import createdTimeConfig from "../properties/created_time/config";
import dateConfig from "../properties/date/config";
import emailConfig from "../properties/email/config";
import filesConfig from "../properties/files/config";
import formulaConfig from "../properties/formula/config";
import lastEditedByConfig from "../properties/last_edited_by/config";
import lastEditedTimeConfig from "../properties/last_edited_time/config";
import multiSelectConfig from "../properties/multi_select/config";
import numberConfig from "../properties/number/config";
import peopleConfig from "../properties/people/config";
import phoneConfig from "../properties/phone/config";
import placeConfig from "../properties/place/config";
import relationConfig from "../properties/relation/config";
import richTextConfig from "../properties/rich_text/config";
import rollupConfig from "../properties/rollup/config";
import selectConfig from "../properties/select/config";
import statusConfig from "../properties/status/config";
import titleConfig from "../properties/title/config";
import uniqueIdConfig from "../properties/unique_id/config";
import urlConfig from "../properties/url/config";

// All property configurations
const propertyConfigs: PropertyConfig[] = [
  buttonConfig,
  checkboxConfig,
  createdByConfig,
  createdTimeConfig,
  dateConfig,
  emailConfig,
  filesConfig,
  formulaConfig,
  lastEditedByConfig,
  lastEditedTimeConfig,
  multiSelectConfig,
  numberConfig,
  peopleConfig,
  phoneConfig,
  placeConfig,
  relationConfig,
  richTextConfig,
  rollupConfig,
  selectConfig,
  statusConfig,
  titleConfig,
  uniqueIdConfig,
  urlConfig,
];

/**
 * Register all property configurations
 *
 * Iterates through all property configs and registers each with the
 * property registry. Validates each config before registration and logs
 * warnings for invalid configs.
 *
 * @returns Number of successfully registered properties
 */
export function registerAllProperties(): number {
  let successCount = 0;

  propertyConfigs.forEach((config) => {
    try {
      // Validate config exists
      if (!config) {
        console.warn("Encountered a null/undefined property config");
        return;
      }

      // Validate config has type
      if (!config.type) {
        console.warn("Property config is missing 'type' field");
        return;
      }

      // Validate config has required components
      if (!config.Renderer) {
        console.warn(`Property config '${config.type}' is missing 'Renderer' component`);
        return;
      }

      if (!config.Editor) {
        console.warn(`Property config '${config.type}' is missing 'Editor' component`);
        return;
      }

      // Register the config
      if (propertyRegistry.register(config)) {
        successCount++;
      }
    } catch (error) {
      console.error(`Error registering property '${config?.type}':`, error);
    }
  });

  return successCount;
}

// Auto-register all properties on module load
// This ensures properties are registered as soon as the registry is imported
if (typeof window !== "undefined") {
  // Only run in browser environment
  registerAllProperties();
}
