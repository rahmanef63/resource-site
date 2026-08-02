/**
 * Data Export/Import Registry
 *
 * Runtime registry logic belongs to the platform layer. Feature-specific
 * importers live in `frontend/shared/bindings/export/*`.
 */

import { featureExportConfigImporters } from "@/frontend/shared/bindings/export/feature-export-registry.generated";
import type {
  FeatureExportConfig,
  ExportFormat,
} from "@/frontend/shared/foundation/utils/data/shared/types/data-export-types"

class DataExportRegistry {
  private configs = new Map<string, FeatureExportConfig>()
  private initialized = false

  private registerNormalized(featureId: string, featureName: string, config: FeatureExportConfig) {
    this.configs.set(featureId, {
      ...config,
      featureId,
      featureName,
    })
  }

  private async loadConfigModule(exportConfigPath: string): Promise<FeatureExportConfig | null> {
    const importer = featureExportConfigImporters[exportConfigPath]
    if (!importer) {
      return null
    }

    const mod = await importer()
    return (mod?.exportConfig ?? mod?.default ?? null) as FeatureExportConfig | null
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      try {
        const docsExportConfig = await this.loadConfigModule("features/documents/data/export-config")
        if (docsExportConfig) {
          this.registerNormalized("knowledge/docs", "Documents", docsExportConfig)
          this.registerNormalized("knowledge/articles", "Knowledge Base", docsExportConfig)
        }
      } catch (error) {
        console.error("Failed to load knowledge/docs export config:", error)
      }

      try {
        const { getAllFeatures } = await import("@/frontend/shared/lib/features/registry")
        type FeatureNode = {
          id: string
          name: string
          hasExportImport?: boolean
          exportConfigPath?: string
          children?: FeatureNode[]
        }

        const flatten = (features: FeatureNode[]): FeatureNode[] =>
          features.flatMap((feature) => [feature, ...(feature.children ? flatten(feature.children) : [])])

        const features = flatten(getAllFeatures() as FeatureNode[])
        const exportable = features.filter((feature) => feature.hasExportImport && feature.exportConfigPath)

        await Promise.all(
          exportable.map(async (feature) => {
            const exportConfigPath = feature.exportConfigPath!
            const config = await this.loadConfigModule(exportConfigPath)
            if (!config) {
              console.warn(
                `No importer registered for exportConfigPath="${exportConfigPath}" (featureId="${feature.id}")`
              )
              return
            }

            this.registerNormalized(feature.id, feature.name, config)
          })
        )
      } catch (error) {
        console.error("Failed to auto-register export configs from feature registry:", error)
      }

      this.initialized = true
    } catch (error) {
      console.error("Failed to initialize export registry:", error)
    }
  }

  async getExportConfig(featureId: string): Promise<FeatureExportConfig | null> {
    if (!this.initialized) {
      await this.initialize()
    }

    return this.configs.get(featureId) || null
  }

  register(featureId: string, config: FeatureExportConfig): void {
    this.configs.set(featureId, config)
  }

  getRegisteredFeatures(): string[] {
    return Array.from(this.configs.keys())
  }

  isFeatureSupported(featureId: string): boolean {
    return this.configs.has(featureId)
  }

  getSupportedFormats(featureId: string): ExportFormat[] {
    const config = this.configs.get(featureId)
    if (!config) return []

    const formats: ExportFormat[] = []
    formats.push("json")
    formats.push("csv")

    return formats
  }
}

export const dataExportRegistry = new DataExportRegistry()

export async function initializeDataExportRegistry(): Promise<void> {
  await dataExportRegistry.initialize()
}

export async function getFeatureExportConfig(featureId: string): Promise<FeatureExportConfig | null> {
  return dataExportRegistry.getExportConfig(featureId)
}

export function registerFeatureExportConfig(
  featureId: string,
  config: FeatureExportConfig
): void {
  dataExportRegistry.register(featureId, config)
}

export function isExportImportSupported(featureId: string): boolean {
  return dataExportRegistry.isFeatureSupported(featureId)
}

export function getSupportedExportFeatures(): string[] {
  return dataExportRegistry.getRegisteredFeatures()
}

export function ExportImport(config: Partial<FeatureExportConfig>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    void config
    void target
    void descriptor
    console.log(`ExportImport decorator applied to ${propertyKey}`)
  }
}
