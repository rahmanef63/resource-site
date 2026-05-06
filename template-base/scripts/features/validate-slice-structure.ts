#!/usr/bin/env tsx
/**
 * Slice Structure Validator
 *
 * Per-slice contract for `frontend/slices/{slug}/`. Each slice is graded
 * against four tiers of required surface so we always know what each
 * feature actually ships.
 *
 *   Required (P0) — slice cannot exist without these:
 *     config.ts            — defineFeature() SSOT
 *     init.ts              — registers settings + agent
 *     index.ts OR page.tsx — module entry
 *
 *   Strongly recommended (P1) — needed for full feature parity:
 *     agent/ OR agents/    — AI agent registration
 *     settings/            — feature settings module
 *     features-preview/    — onboarding mock preview
 *     views/ OR components/ — at least one UI surface
 *
 *   Nice-to-have (P2) — depends on feature shape:
 *     hooks/               — data hooks
 *     types/               — TypeScript types
 *     lib/ OR utils/       — helpers (optional)
 *
 *   Convex parity (P0 if `hasConvex: true` in config):
 *     convex/features/{camelCaseSlug}/  — backend folder exists
 *
 * Output:
 *   stdout — pretty table per slice with grade
 *   --json — machine-readable JSON for CI
 *   exit 1 — when any P0 fails
 *
 * Run:
 *   pnpm validate:slice-structure
 *   pnpm validate:slice-structure --json
 */

import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const SLICES = path.join(ROOT, "frontend/slices")
const CONVEX_FEATURES = path.join(ROOT, "convex/features")

interface Result {
  slug: string
  grade: "A" | "B" | "C" | "FAIL"
  hasConvex: boolean
  missingP0: string[]
  missingP1: string[]
  missingP2: string[]
  notes: string[]
}

function toCamel(kebab: string): string {
  const parts = kebab.split("-")
  return parts[0] + parts.slice(1).map((p) => p[0].toUpperCase() + p.slice(1)).join("")
}

function exists(p: string): boolean {
  try { fs.accessSync(p); return true } catch { return false }
}

function fileOrDir(slugDir: string, candidates: string[]): boolean {
  return candidates.some((c) => exists(path.join(slugDir, c)))
}

function detectHasConvex(slugDir: string): boolean {
  const config = path.join(slugDir, "config.ts")
  if (!exists(config)) return false
  const body = fs.readFileSync(config, "utf-8")
  return /hasConvex\s*:\s*true/.test(body)
}

function gradeOne(slug: string): Result {
  const slugDir = path.join(SLICES, slug)
  const missingP0: string[] = []
  const missingP1: string[] = []
  const missingP2: string[] = []
  const notes: string[] = []

  // P0 — required.
  if (!exists(path.join(slugDir, "config.ts"))) missingP0.push("config.ts")
  if (!exists(path.join(slugDir, "init.ts")))   missingP0.push("init.ts")
  if (!fileOrDir(slugDir, ["index.ts", "index.tsx", "page.tsx"]))
    missingP0.push("index.ts / page.tsx")

  // P1 — strongly recommended.
  if (!fileOrDir(slugDir, ["agent", "agents"]))     missingP1.push("agent/")
  if (!exists(path.join(slugDir, "settings")))      missingP1.push("settings/")
  if (!exists(path.join(slugDir, "features-preview"))) missingP1.push("features-preview/")
  if (!fileOrDir(slugDir, ["views", "components"]))    missingP1.push("views/ or components/")

  // P2 — nice-to-have.
  if (!exists(path.join(slugDir, "hooks")))           missingP2.push("hooks/")
  if (!exists(path.join(slugDir, "types")))           missingP2.push("types/")

  // Convex parity.
  const hasConvex = detectHasConvex(slugDir)
  if (hasConvex) {
    const camel = toCamel(slug)
    const convexDir = path.join(CONVEX_FEATURES, camel)
    if (!exists(convexDir)) {
      const fallback = path.join(CONVEX_FEATURES, slug)
      if (exists(fallback)) {
        notes.push(`convex dir found at non-canonical path: convex/features/${slug}/ (expected ${camel})`)
      } else {
        missingP0.push(`convex/features/${camel}/`)
      }
    }
  }

  let grade: Result["grade"]
  if (missingP0.length > 0) grade = "FAIL"
  else if (missingP1.length === 0) grade = "A"
  else if (missingP1.length <= 1) grade = "B"
  else grade = "C"

  return { slug, grade, hasConvex, missingP0, missingP1, missingP2, notes }
}

function main() {
  const args = process.argv.slice(2)
  const json = args.includes("--json")

  if (!exists(SLICES)) {
    console.error(`Slices directory not found: ${SLICES}`)
    process.exit(2)
  }

  const slugs = fs.readdirSync(SLICES)
    .filter((name) => !name.startsWith("_"))
    .filter((name) => fs.statSync(path.join(SLICES, name)).isDirectory())
    .sort()

  const results = slugs.map(gradeOne)
  const counts = { A: 0, B: 0, C: 0, FAIL: 0 } as Record<Result["grade"], number>
  results.forEach((r) => { counts[r.grade]++ })

  const failures = results.filter((r) => r.grade === "FAIL")

  if (json) {
    console.log(JSON.stringify({ results, counts, failureCount: failures.length }, null, 2))
  } else {
    console.log("\nSlice Structure Validator\n")
    console.log("Grade:")
    console.log("  A    — every P0 + every P1 present")
    console.log("  B    — every P0 + at most 1 P1 missing")
    console.log("  C    — every P0 + 2+ P1 missing")
    console.log("  FAIL — at least one P0 missing (config / init / page / convex parity)\n")

    console.log("─".repeat(120))
    console.log(`${"GRADE".padEnd(6)} ${"SLUG".padEnd(28)} ${"CONVEX".padEnd(8)} MISSING (P0 = blocker, P1 = recommended)`)
    console.log("─".repeat(120))

    for (const r of results) {
      const missing: string[] = []
      if (r.missingP0.length > 0) missing.push(`P0:${r.missingP0.join(",")}`)
      if (r.missingP1.length > 0) missing.push(`P1:${r.missingP1.join(",")}`)
      if (r.missingP2.length > 0) missing.push(`P2:${r.missingP2.join(",")}`)
      const note = r.notes.length > 0 ? ` | ${r.notes.join("; ")}` : ""
      console.log(`${r.grade.padEnd(6)} ${r.slug.padEnd(28)} ${(r.hasConvex ? "yes" : "no").padEnd(8)} ${missing.join(" ") || "—"}${note}`)
    }

    console.log("─".repeat(120))
    console.log(`Totals: A=${counts.A}  B=${counts.B}  C=${counts.C}  FAIL=${counts.FAIL}\n`)
  }

  // Exit non-zero only on P0 failures (FAIL); B/C don't gate CI.
  process.exit(failures.length > 0 ? 1 : 0)
}

main()
