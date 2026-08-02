/**
 * CMS Template Provider
 * Adapter that implements TemplateProvider interface for CMS feature
 *
 * This allows TemplateLibrary (shared component) to work with CMS templates
 * without directly importing from CMS feature
 */

import type { TemplateProvider } from "@/frontend/shared/builder"
import {
  getDefaultTemplates,
  listAssetTemplates,
  saveAssetTemplate,
  deleteAssetTemplate,
} from "./templateStore"

/**
 * CMS Template Provider Implementation
 *
 * @example
 * ```tsx
 * import { cmsTemplateProvider } from "@/frontend/slices/studio/ui/state/templateProvider"
 * import { TemplateLibrary } from "@/frontend/shared/builder"
 *
 * <TemplateLibrary
 *   onOpen={handleOpen}
 *   templateProvider={cmsTemplateProvider}
 * />
 * ```
 */
export const cmsTemplateProvider: TemplateProvider = {
  /**
   * Get built-in CMS templates
   */
  getDefaultTemplates: () => getDefaultTemplates(),

  /**
   * List saved asset templates from localStorage
   */
  listAssetTemplates: () => {
    return listAssetTemplates()
  },

  /**
   * Save a new asset template to localStorage
   */
  saveAssetTemplate: (name: string, schema: any) => {
    saveAssetTemplate(name, schema)
  },

  /**
   * Delete an asset template from localStorage
   */
  deleteAssetTemplate: (name: string) => {
    deleteAssetTemplate(name)
  },
}

/**
 * Export individual functions for backwards compatibility
 * (if CMS code imports these directly)
 */
export {
  getDefaultTemplates,
  listAssetTemplates,
  saveAssetTemplate,
  deleteAssetTemplate,
}
