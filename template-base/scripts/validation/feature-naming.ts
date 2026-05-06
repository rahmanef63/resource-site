#!/usr/bin/env node
/**
 * Feature Naming Validation
 *
 * Usage:
 * - pnpm run validate:feature-naming
 * - pnpm run validate:feature-naming -- --strict
 * - pnpm run validate:feature-naming -- --json
 */

import { resolve } from "node:path"
import {
  type ValidationIssue,
  collectFeatureStandardsIssues,
  shouldFailValidation,
  summarizeIssues,
} from "./rules/feature-standards"

interface CliOptions {
  strict: boolean
  json: boolean
  rootDir: string
}

function parseArgs(argv: string[]): CliOptions {
  const strict = argv.includes("--strict")
  const json = argv.includes("--json")

  const rootArgIndex = argv.indexOf("--root")
  const rootArg = rootArgIndex >= 0 ? argv[rootArgIndex + 1] : undefined
  const rootDir = resolve(rootArg ?? process.cwd())

  return { strict, json, rootDir }
}

function printTextReport(
  issues: ValidationIssue[],
  summary: { errors: number; warnings: number },
  options: CliOptions,
): void {
  console.log("Feature standards validation")
  console.log(`Root: ${options.rootDir}`)
  console.log(`Mode: ${options.strict ? "strict" : "default"}`)
  console.log(`Errors: ${summary.errors}`)
  console.log(`Warnings: ${summary.warnings}`)

  if (issues.length === 0) {
    console.log("\nNo rule violations found.")
    return
  }

  const errors = issues.filter((issue) => issue.severity === "error")
  const warnings = issues.filter((issue) => issue.severity === "warning")

  if (errors.length > 0) {
    console.log("\nErrors:")
    for (const issue of errors) {
      console.log(`- [${issue.code}] [${issue.featureId}] ${issue.message}`)
      if (issue.path) console.log(`  path: ${issue.path}`)
      if (issue.suggestion) console.log(`  fix: ${issue.suggestion}`)
    }
  }

  if (warnings.length > 0) {
    console.log("\nWarnings:")
    for (const issue of warnings) {
      console.log(`- [${issue.code}] [${issue.featureId}] ${issue.message}`)
      if (issue.path) console.log(`  path: ${issue.path}`)
      if (issue.suggestion) console.log(`  fix: ${issue.suggestion}`)
    }
  }
}

function main(): void {
  try {
    const options = parseArgs(process.argv.slice(2))
    const issues = collectFeatureStandardsIssues(options.rootDir)
    const summary = summarizeIssues(issues)

    const shouldFail = shouldFailValidation(summary, options.strict)

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            rootDir: options.rootDir,
            mode: options.strict ? "strict" : "default",
            summary,
            issues,
          },
          null,
          2,
        ),
      )
    } else {
      printTextReport(issues, summary, options)
    }

    process.exit(shouldFail ? 1 : 0)
  } catch (error) {
    console.error("Unexpected error while validating feature naming")
    console.error(error)
    process.exit(1)
  }
}

main()
