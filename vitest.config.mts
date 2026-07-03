import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"
import fs from "node:fs"

// tsconfig's `@/shared/*` fans out to BOTH components/shared/* and
// lib/shared/* — resolve whichever exists (vitest doesn't read tsconfig paths).
// Implemented as a pre-enforced resolveId plugin: alias `customResolver` is
// deprecated and gone in Vite 9.
function sharedFanoutPlugin() {
  const resolveExisting = (base: string) => {
    for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
      const candidate = base + ext
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
    }
    return null
  }
  return {
    name: "rr-shared-fanout",
    enforce: "pre" as const,
    resolveId(source: string) {
      // vite:alias runs first, so the specifier may already be rewritten to
      // the components/shared absolute path — handle both forms.
      const componentsShared = path.resolve(__dirname, "components/shared") + "/"
      let rel: string
      if (source.startsWith("@/shared/")) rel = source.slice("@/shared/".length)
      else if (source.startsWith(componentsShared)) rel = source.slice(componentsShared.length)
      else return null
      return (
        resolveExisting(path.resolve(__dirname, "components/shared", rel)) ??
        resolveExisting(path.resolve(__dirname, "lib/shared", rel))
      )
    },
  }
}

export default defineConfig({
  plugins: [sharedFanoutPlugin(), react()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: [
      "shared/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
      "packages/cli/**/*.test.{mjs,ts}",
      "frontend/slices/**/*.test.{ts,tsx}",
      "convex/features/**/*.test.{ts,tsx}",
      "scripts/**/*.test.{mjs,ts}",
    ],
    setupFiles: [],
  },
  resolve: {
    // Mirrors tsconfig paths — specific mappings before the generic "@" root.
    alias: [
      { find: /^@notion\//, replacement: path.resolve(__dirname, "frontend/slices/notion-app") + "/" },
      { find: /^@\/features\//, replacement: path.resolve(__dirname, "frontend/slices") + "/" },
      { find: /^@\/shared\//, replacement: path.resolve(__dirname, "components/shared") + "/" },
      { find: /^@\//, replacement: path.resolve(__dirname, ".") + "/" },
    ],
  },
})
