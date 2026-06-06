import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"
import fs from "node:fs"

// tsconfig's `@/shared/*` fans out to BOTH components/shared/* and
// lib/shared/* — resolve whichever exists (vitest doesn't read tsconfig paths).
function sharedResolver(source: string) {
  const fromComponents = source
  const fromLib = path.resolve(
    __dirname,
    "lib/shared",
    path.relative(path.resolve(__dirname, "components/shared"), source),
  )
  for (const base of [fromComponents, fromLib]) {
    for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
      const candidate = base + ext
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
    }
  }
  return null
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: [
      "shared/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "packages/cli/lib/**/*.test.{mjs,ts}",
      "frontend/slices/**/*.test.{ts,tsx}",
      "convex/features/**/*.test.{ts,tsx}",
    ],
    setupFiles: [],
  },
  resolve: {
    // Mirrors tsconfig paths — specific mappings before the generic "@" root.
    alias: [
      { find: /^@notion\//, replacement: path.resolve(__dirname, "frontend/slices/notion") + "/" },
      { find: /^@\/features\//, replacement: path.resolve(__dirname, "frontend/slices") + "/" },
      { find: /^@\/shared\//, replacement: path.resolve(__dirname, "components/shared") + "/", customResolver: sharedResolver },
      { find: /^@\//, replacement: path.resolve(__dirname, ".") + "/" },
    ],
  },
})
