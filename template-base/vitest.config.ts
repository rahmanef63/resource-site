import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * Vitest config for template-base.
 *
 * Why a dedicated config: tsconfig.json sets `jsx: "preserve"` (Next 16
 * convention), but vite/vitest needs the React plugin to transform JSX
 * into runtime calls. The `@vitejs/plugin-react` plugin overrides at the
 * loader layer — tsconfig stays untouched.
 *
 * Aliases mirror tsconfig.json `paths` so imports resolve identically in
 * test and in `tsc --noEmit`.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts", "./tests/setup-react.ts"],
    include: [
      "tests/**/*.test.{ts,tsx}",
      "frontend/**/*.test.{ts,tsx}",
      "lib/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "scripts/",
        ".next/",
        "convex/_generated/",
      ],
    },
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/convex": path.resolve(__dirname, "./convex"),
      "@convex": path.resolve(__dirname, "./convex"),
      "@convex/_generated": path.resolve(__dirname, "./convex/_generated"),
      "@notion": path.resolve(__dirname, "./frontend/slices/notion"),
      "@notionConvex": path.resolve(__dirname, "./convex/features/notion"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
});
