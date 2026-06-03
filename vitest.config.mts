import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

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
    ],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@notion": path.resolve(__dirname, "frontend/slices/notion"),
      "@": path.resolve(__dirname, "."),
    },
  },
})
