/**
 * Feature Definition Helper
 *
 * Use this to define features in a type-safe, validated way.
 * Each feature should have a config.ts that uses this helper.
 */

import { z } from 'zod'

import {
  FEATURE_BUNDLE_IDS,
  FEATURE_GENERATION_MODES,
  FEATURE_STATUS_STATES,
  FEATURE_TYPES,
  FEATURE_UI_CATEGORIES,
  SEMVER_REGEX,
} from '@/lib/features/constants'

// ============================================================================
// BUNDLE IDS - All available workspace bundle templates
// ============================================================================

/**
 * Available Bundle IDs
 * Features declare which bundles they belong to via `bundles` config
 */
export const BUNDLE_IDS = FEATURE_BUNDLE_IDS

export type BundleId = typeof BUNDLE_IDS[number]

// ============================================================================
// SCHEMA
// ============================================================================

const UIConfigSchema = z.object({
  icon: z.string(),
  path: z.string().startsWith('/'),
  component: z.string(),
  category: z.enum(FEATURE_UI_CATEGORIES),
  order: z.number().min(0),
})

const TechnicalConfigSchema = z.object({
  featureType: z.enum(FEATURE_TYPES),
  hasUI: z.boolean().default(true),
  hasConvex: z.boolean().default(true),
  hasTests: z.boolean().default(true),
  version: z.string().regex(SEMVER_REGEX), // semver
})

const GenerationConfigSchema = z.object({
  mode: z.enum(FEATURE_GENERATION_MODES).default("full-json"),
  sharedEngineId: z.string().min(1).optional(),
})

const StatusConfigSchema = z.object({
  state: z.enum(FEATURE_STATUS_STATES),
  isReady: z.boolean(),
  expectedRelease: z.string().optional(),
})

/**
 * Bundle Configuration Schema
 * 
 * Each feature declares which bundles it belongs to and its role in each bundle:
 * - core: Feature is always enabled and cannot be disabled
 * - recommended: Feature is enabled by default but can be disabled
 * - optional: Feature is disabled by default but can be enabled
 */
const BundleConfigSchema = z.object({
  // Bundles where this feature is CORE (cannot be disabled)
  core: z.array(z.enum(BUNDLE_IDS)).default([]),
  // Bundles where this feature is RECOMMENDED (enabled by default)
  recommended: z.array(z.enum(BUNDLE_IDS)).default([]),
  // Bundles where this feature is OPTIONAL (disabled by default)
  optional: z.array(z.enum(BUNDLE_IDS)).default([]),
}).optional()

// App Store metadata schema — optional, filled in by admin per feature
const AppStoreConfigSchema = z.object({
  /** Multi-paragraph description shown in the detail sheet */
  longDescription: z.string().optional(),
  /** Hero banner image (public URL, e.g. /features/tasks/banner.png) */
  banner: z.string().optional(),
  /** Screenshot image URLs shown in carousel */
  screenshots: z.array(z.string()).optional(),
  /** Bullet-point key feature highlights */
  highlights: z.array(z.string()).optional(),
  /** Recent changes / What's New text */
  whatsNew: z.string().optional(),
  /** App Store badge label */
  badge: z.enum(['new', 'featured', 'updated', 'popular']).optional(),
}).optional()

// Base schema without children
const BaseFeatureConfigSchema = z.object({
  // Identity
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),

  // Configurations
  ui: UIConfigSchema,
  technical: TechnicalConfigSchema,
  status: StatusConfigSchema,
  generation: GenerationConfigSchema.default({
    mode: "full-json",
  }),

  // Navigation (Zero Hardcoding)
  navigation: z.object({
    route: z.string().optional(), // Override ui.path if needed
    aliases: z.array(z.string()).optional(), // General aliases for the feature root
    patterns: z.any().optional(), // Using z.any() due to Zod issue with z.record in this version
  }).optional(),

  // Bundle membership - REQUIRED for non-system features
  bundles: BundleConfigSchema,

  // Optional metadata
  tags: z.array(z.string()).optional(),
  permissions: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  author: z.string().optional(),

  // Settings integration
  hasSettings: z.boolean().optional(),
  settingsPath: z.string().optional(),

  // Export/Import integration
  hasExportImport: z.boolean().optional(),
  exportConfigPath: z.string().optional(),

  // Agent Configuration (New 10/10 Standard)
  agent: z.object({
    definitionPath: z.string().describe("Path to backend agent definition relative to repo root (e.g., 'convex/features/documents/agent.ts')"),
    capabilities: z.array(z.enum(['create', 'read', 'update', 'delete', 'search'])).default([]),
  }).optional(),

  // App Store Metadata (admin fills in per feature for mobile discovery UI)
  appStore: AppStoreConfigSchema,
}).superRefine((value, ctx) => {
  if (
    value.generation.mode !== "full-json" &&
    !value.generation.sharedEngineId
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "sharedEngineId is required when generation.mode is not full-json",
      path: ["generation", "sharedEngineId"],
    })
  }
})

type RecursiveFeatureConfig = z.infer<typeof BaseFeatureConfigSchema> & {
  children?: RecursiveFeatureConfig[]
}

type RecursiveFeatureConfigInput = z.input<typeof BaseFeatureConfigSchema> & {
  children?: RecursiveFeatureConfigInput[]
}

const FeatureConfigSchema: z.ZodType<RecursiveFeatureConfig> = BaseFeatureConfigSchema.safeExtend({
  children: z.lazy(() => z.array(FeatureConfigSchema)).optional(),
})

// Recursive types for children
export type FeatureConfig = RecursiveFeatureConfig
export type FeatureConfigInput = RecursiveFeatureConfigInput

// ============================================================================
// HELPER FUNCTION
// ============================================================================

/**
 * Define a feature with validation
 *
 * @example
 * ```ts
 * export default defineFeature({
 *   id: 'builder',
 *   name: 'Builder',
 *   description: 'Create content, automation, and interfaces with visual node canvas',
 *   ui: {
 *     icon: 'Hammer',
 *     path: '/dashboard/builder',
 *     component: 'BuilderPage',
 *     category: 'creativity',
 *     order: 20,
 *   },
 *   technical: {
 *     featureType: 'optional',
 *     hasUI: true,
 *     hasConvex: true,
 *     hasTests: true,
 *     version: '1.0.0',
 *   },
 *   status: {
 *     state: 'stable',
 *     isReady: true,
 *   },
 *   bundles: {
 *     core: [],
 *     recommended: ['content-creator', 'digital-agency'],
 *     optional: ['startup', 'business-pro', 'personal-productivity'],
 *   },
 *   tags: ['builder', 'content', 'automation', 'visual'],
 * })
 * ```
 */
export function defineFeature(config: FeatureConfigInput): FeatureConfig {
  // Validate at definition time
  const validated = FeatureConfigSchema.parse(config)

  // Warn if non-system feature has no bundle configuration
  if (
    validated.technical.featureType !== 'system' &&
    (!validated.bundles ||
      (validated.bundles.core.length === 0 &&
        validated.bundles.recommended.length === 0 &&
        validated.bundles.optional.length === 0))
  ) {
    console.warn(
      `[defineFeature] Feature "${validated.id}" has no bundle configuration. ` +
      `It won't appear in any workspace template.`
    )
  }

  return validated
}

/**
 * Type guard to check if something is a valid feature config
 */
export function isFeatureConfig(value: unknown): value is FeatureConfig {
  return FeatureConfigSchema.safeParse(value).success
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FeatureConfigSchema }
