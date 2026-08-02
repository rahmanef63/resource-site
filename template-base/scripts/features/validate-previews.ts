#!/usr/bin/env tsx
/**
 * Preview Quality Validator
 *
 * Per-slice contract check for `frontend/slices/{slug}/features-preview/index.tsx`:
 *
 *   1. Module exists and exports a default `FeaturePreviewDefinition`.
 *   2. Module imports at least one symbol from `../components`, `../views`,
 *      `../hooks`, or `../page` (i.e. reuses the real slice surface — no
 *      bespoke shadow UI).
 *   3. Has at least one `mockDataSets[]` entry so consumers can render with
 *      real data.
 *
 * Modes:
 *   tsx scripts/features/validate-previews.ts            # pretty table, exits 0/1
 *   tsx scripts/features/validate-previews.ts --json     # JSON for CI
 *
 * Exit codes:
 *   0 = all features pass
 *   1 = at least one feature fails (B / C grade)
 */

import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const SLICES_DIR = path.join(ROOT, "frontend/slices")
const SETTINGS_DIR = path.join(ROOT, "frontend/shared/settings")
const ALLOWLIST_PATH = path.join(ROOT, "scripts/features/preview-allowlist.json")

type Grade = "A" | "B" | "C" | "MISSING" | "ALLOWED"

interface AllowlistEntry {
  reason: string
  addedAt: string
  reviewBy: string
}
type Allowlist = Record<string, AllowlistEntry>

function loadAllowlist(): Allowlist {
  if (!fs.existsSync(ALLOWLIST_PATH)) return {}
  try {
    const raw = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf-8")) as { allowlist?: Allowlist }
    return raw.allowlist ?? {}
  } catch {
    return {}
  }
}

interface Result {
  slug: string
  source: "slice" | "setting"
  hasFile: boolean
  loc: number
  importsRealSymbols: number
  hasMockData: boolean
  grade: Grade
  notes: string[]
  allowlistReason?: string
}

const REAL_IMPORT_RE = /from\s+['"]\.\.\/(components|views|hooks|page)([^'"]*)['"]/g
const MOCK_DATA_RE = /mockDataSets\s*:\s*\[\s*[{[]/

function findPreviewFile(dir: string): string | null {
  for (const ext of ["index.tsx", "index.ts"]) {
    const p = path.join(dir, "features-preview", ext)
    if (fs.existsSync(p)) return p
  }
  return null
}

function gradeOne(file: string | null): Pick<Result, "loc" | "importsRealSymbols" | "hasMockData" | "grade" | "notes"> {
  if (!file) {
    return { loc: 0, importsRealSymbols: 0, hasMockData: false, grade: "MISSING", notes: ["features-preview/index.tsx not found"] }
  }

  const body = fs.readFileSync(file, "utf-8")
  const loc = body.split(/\r?\n/).length
  const importsRealSymbols = (body.match(REAL_IMPORT_RE) || []).length
  const hasMockData = MOCK_DATA_RE.test(body)

  const notes: string[] = []
  let grade: Grade = "C"

  if (importsRealSymbols >= 1 && hasMockData) {
    grade = "A"
    notes.push(`imports ${importsRealSymbols} symbol(s) from sibling slice`)
  } else if (importsRealSymbols >= 1) {
    grade = "B"
    notes.push("imports real components but missing mockDataSets")
  } else if (loc <= 60 && hasMockData) {
    grade = "C"
    notes.push("placeholder stub — wire real components from ../components or ../views")
  } else if (loc > 60 && !hasMockData) {
    grade = "C"
    notes.push("bespoke shadow UI without mockDataSets — refactor to import real components")
  } else if (loc > 60) {
    grade = "B"
    notes.push("bespoke shadow UI duplicates real slice components — refactor to import")
  } else {
    notes.push("manual review required")
  }

  return { loc, importsRealSymbols, hasMockData, grade, notes }
}

function scanRoot(rootDir: string, source: "slice" | "setting"): Result[] {
  if (!fs.existsSync(rootDir)) return []
  return fs.readdirSync(rootDir)
    .filter((name) => !name.startsWith("_") && fs.statSync(path.join(rootDir, name)).isDirectory())
    .filter((name) => {
      // For settings root: only include dirs that have either config.ts or features-preview/
      if (source === "setting") {
        const hasConfig = fs.existsSync(path.join(rootDir, name, "config.ts"))
        const hasPreview = fs.existsSync(path.join(rootDir, name, "features-preview"))
        return hasConfig || hasPreview
      }
      return true
    })
    .map((slug) => {
      const file = findPreviewFile(path.join(rootDir, slug))
      const partial = gradeOne(file)
      return { slug, source, hasFile: Boolean(file), ...partial }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

function applyAllowlist(results: Result[], allow: Allowlist): Result[] {
  return results.map((r) => {
    const entry = allow[r.slug]
    if (!entry) return r
    if (r.grade === "A") return r // no need to allowlist if already passing
    return {
      ...r,
      grade: "ALLOWED" as Grade,
      allowlistReason: entry.reason,
      notes: [`allowlisted: ${entry.reason}`],
    }
  })
}

function main() {
  const args = process.argv.slice(2)
  const json = args.includes("--json")
  const allow = loadAllowlist()

  const rawResults = [
    ...scanRoot(SLICES_DIR, "slice"),
    ...scanRoot(SETTINGS_DIR, "setting"),
  ]
  const results = applyAllowlist(rawResults, allow)

  const counts: Record<Grade, number> = { A: 0, B: 0, C: 0, MISSING: 0, ALLOWED: 0 }
  results.forEach((r) => { counts[r.grade]++ })

  const failed = results.filter((r) => r.grade === "B" || r.grade === "C" || r.grade === "MISSING")

  if (json) {
    console.log(JSON.stringify({ results, counts, failedCount: failed.length }, null, 2))
  } else {
    console.log("\nPreview Quality Validator\n")
    console.log("Grade rules:")
    console.log("  A — imports real slice components AND has mockDataSets")
    console.log("  B — imports real components but missing mockData OR uses real components partially")
    console.log("  C — bespoke shadow UI / placeholder stub (does not reuse slice components)")
    console.log("  MISSING — features-preview/index.tsx not found")
    console.log("  ALLOWED — allowlisted with documented reason (see scripts/features/preview-allowlist.json)\n")

    console.log("─".repeat(110))
    console.log(`${"GRADE".padEnd(8)} ${"SLUG".padEnd(28)} ${"LOC".padStart(5)} ${"IMP".padStart(5)} ${"MOCK".padStart(5)} NOTE`)
    console.log("─".repeat(110))

    for (const r of results) {
      console.log(`${r.grade.padEnd(8)} ${r.slug.padEnd(28)} ${String(r.loc).padStart(5)} ${String(r.importsRealSymbols).padStart(5)} ${(r.hasMockData ? "yes" : "no").padStart(5)} ${r.notes[0] ?? ""}`)
    }

    console.log("─".repeat(110))
    console.log(`Totals: A=${counts.A}  B=${counts.B}  C=${counts.C}  MISSING=${counts.MISSING}  ALLOWED=${counts.ALLOWED}  (failures = B+C+MISSING = ${failed.length})\n`)
  }

  process.exit(failed.length > 0 ? 1 : 0)
}

main()
