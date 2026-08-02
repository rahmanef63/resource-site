import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { glob } from "glob"

export type ValidationIssueSeverity = "error" | "warning"

export interface ValidationIssue {
  code: "FS001" | "FS002" | "FS003" | "FS004" | "FS005"
  severity: ValidationIssueSeverity
  featureId: string
  path?: string
  message: string
  suggestion?: string
}

interface FeatureConfigFile {
  frontendSlug: string
  configPath: string
}

interface FeatureDescriptor {
  featureId: string
  frontendSlug: string
  configPath: string
  hasConvex: boolean
}

function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function toConvexSlug(featureId: string): string {
  return featureId.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function discoverFeatureConfigFiles(rootDir: string): FeatureConfigFile[] {
  const configRootFiles = glob.sync("frontend/slices/*/config.ts", {
    cwd: rootDir,
    absolute: true,
    nodir: true,
  })
  const configNestedFiles = glob.sync("frontend/slices/*/config/index.ts", {
    cwd: rootDir,
    absolute: true,
    nodir: true,
  })

  const byFrontendSlug = new Map<string, string>()

  for (const configPath of configRootFiles) {
    const frontendSlug = basename(dirname(configPath))
    byFrontendSlug.set(frontendSlug, configPath)
  }

  for (const configPath of configNestedFiles) {
    const frontendSlug = basename(dirname(dirname(configPath)))
    if (!byFrontendSlug.has(frontendSlug)) {
      byFrontendSlug.set(frontendSlug, configPath)
    }
  }

  return Array.from(byFrontendSlug.entries()).map(([frontendSlug, configPath]) => ({
    frontendSlug,
    configPath,
  }))
}

function parseFeatureConfig(configPath: string): { featureId: string | null; hasConvex: boolean } {
  const content = readFileSync(configPath, "utf8")

  const idMatch = content.match(/^\s*id:\s*['"]([^'"]+)['"]/m)
  const hasConvexMatch = content.match(/hasConvex:\s*(true|false)/)

  return {
    featureId: idMatch?.[1] ?? null,
    hasConvex: hasConvexMatch?.[1] === "true",
  }
}

function sortIssues(issues: ValidationIssue[]): ValidationIssue[] {
  const severityOrder: Record<ValidationIssueSeverity, number> = {
    error: 0,
    warning: 1,
  }

  return [...issues].sort((left, right) => {
    if (left.severity !== right.severity) {
      return severityOrder[left.severity] - severityOrder[right.severity]
    }
    if (left.code !== right.code) {
      return left.code.localeCompare(right.code)
    }
    if (left.featureId !== right.featureId) {
      return left.featureId.localeCompare(right.featureId)
    }
    return (left.path ?? "").localeCompare(right.path ?? "")
  })
}

export function collectFeatureStandardsIssues(rootDir: string): ValidationIssue[] {
  const resolvedRootDir = resolve(rootDir)
  const issues: ValidationIssue[] = []
  const featureDescriptors: FeatureDescriptor[] = []

  const configFiles = discoverFeatureConfigFiles(resolvedRootDir)

  for (const file of configFiles) {
    const parsed = parseFeatureConfig(file.configPath)
    const featureId = parsed.featureId ?? file.frontendSlug

    if (!parsed.featureId) {
      issues.push({
        code: "FS001",
        severity: "error",
        featureId,
        path: file.configPath,
        message: "Missing `id` in feature config.",
        suggestion: "Add `id: \"my-feature\"` in config.ts using kebab-case.",
      })
    }

    featureDescriptors.push({
      featureId,
      frontendSlug: file.frontendSlug,
      configPath: file.configPath,
      hasConvex: parsed.hasConvex,
    })
  }

  const byFeatureId = new Map<string, FeatureDescriptor[]>()
  for (const feature of featureDescriptors) {
    const existing = byFeatureId.get(feature.featureId) ?? []
    existing.push(feature)
    byFeatureId.set(feature.featureId, existing)
  }

  for (const [featureId, duplicates] of byFeatureId.entries()) {
    if (duplicates.length <= 1) continue

    for (const duplicate of duplicates) {
      issues.push({
        code: "FS005",
        severity: "error",
        featureId,
        path: duplicate.configPath,
        message: `Duplicate feature.id "${featureId}" detected.`,
        suggestion: "Use unique `id` values across all `frontend/slices/*/config.ts` files.",
      })
    }
  }

  for (const feature of featureDescriptors) {
    if (!isKebabCase(feature.featureId)) {
      issues.push({
        code: "FS001",
        severity: "error",
        featureId: feature.featureId,
        path: feature.configPath,
        message: `feature.id "${feature.featureId}" must be kebab-case.`,
        suggestion: "Rename `id` to kebab-case, for example: `my-feature`.",
      })
    }

    if (feature.frontendSlug !== feature.featureId) {
      issues.push({
        code: "FS002",
        severity: "warning",
        featureId: feature.featureId,
        path: join(resolvedRootDir, "frontend", "slices", feature.frontendSlug),
        message: `Frontend folder "${feature.frontendSlug}" differs from feature.id "${feature.featureId}".`,
        suggestion: `Rename frontend folder to "${feature.featureId}" when migration is ready.`,
      })
    }

    if (!feature.hasConvex) {
      continue
    }

    const expectedConvexSlug = toConvexSlug(feature.featureId)
    const convexCandidates = unique([
      expectedConvexSlug,
      feature.featureId,
      feature.featureId.replace(/-/g, "_"),
      toConvexSlug(feature.frontendSlug),
      feature.frontendSlug,
    ])

    const existingConvexSlug = convexCandidates.find((candidate) =>
      existsSync(join(resolvedRootDir, "convex", "features", candidate))
    )

    if (!existingConvexSlug) {
      issues.push({
        code: "FS003",
        severity: "error",
        featureId: feature.featureId,
        path: join(resolvedRootDir, "convex", "features"),
        message: `Missing convex folder for feature "${feature.featureId}".`,
        suggestion: `Create "convex/features/${expectedConvexSlug}" or set hasConvex to false.`,
      })
      continue
    }

    if (existingConvexSlug !== expectedConvexSlug) {
      issues.push({
        code: "FS004",
        severity: "warning",
        featureId: feature.featureId,
        path: join(resolvedRootDir, "convex", "features", existingConvexSlug),
        message: `Convex folder "${existingConvexSlug}" differs from expected "${expectedConvexSlug}".`,
        suggestion: `Rename to "convex/features/${expectedConvexSlug}" after import migration.`,
      })
    }
  }

  return sortIssues(issues)
}

export function summarizeIssues(issues: ValidationIssue[]): { errors: number; warnings: number } {
  return issues.reduce(
    (summary, issue) => {
      if (issue.severity === "error") summary.errors += 1
      if (issue.severity === "warning") summary.warnings += 1
      return summary
    },
    { errors: 0, warnings: 0 },
  )
}

export function shouldFailValidation(
  summary: { errors: number; warnings: number },
  strict: boolean,
): boolean {
  return summary.errors > 0 || (strict && summary.warnings > 0)
}
