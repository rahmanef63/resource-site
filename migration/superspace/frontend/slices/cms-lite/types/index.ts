/**
 * Type definitions for cms-lite feature
 */

import type { BaseEntity } from "../../../shared/types"

export interface CmsLiteItem extends BaseEntity {
  name: string
}

export interface CmsLiteConfig {
  enabled: boolean
  settings?: Record<string, unknown>
}
