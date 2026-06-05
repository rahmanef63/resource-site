export const THEMES = {
  dark:  { bg: "bg-zinc-950 text-zinc-200", panel: "bg-zinc-900/60", editor: "bg-[#0b0b0e]", border: "border-zinc-800" },
  light: { bg: "bg-zinc-50 text-zinc-900",   panel: "bg-white/80",     editor: "bg-white",     border: "border-zinc-200" },
  sepia: { bg: "bg-[#f5f1e8] text-[#3a2f23]", panel: "bg-[#ede5d3]/80", editor: "bg-[#f5ebd7]",  border: "border-[#d8cba8]" },
};

export type ThemeId = keyof typeof THEMES;

// ── Mock filesystem (async, listed PER FOLDER) ─────────────────────────────
// Real-IDE rule: the explorer never loads the whole tree up front. Each
// folder's children are fetched on expand (here: a Map lookup behind a small
// latency) and DROPPED again on collapse, so RAM/DOM stay proportional to
// what is open — node_modules below has 60 packages and costs nothing until
// someone actually expands it.

export type DirEntry = { name: string; kind: "dir" | "file" };

const DIRS: Record<string, DirEntry[]> = {
  "": [
    { name: "app", kind: "dir" },
    { name: "components", kind: "dir" },
    { name: "convex", kind: "dir" },
    { name: "frontend", kind: "dir" },
    { name: "lib", kind: "dir" },
    { name: "node_modules", kind: "dir" },
    { name: "public", kind: "dir" },
    { name: "next.config.mjs", kind: "file" },
    { name: "package.json", kind: "file" },
    { name: "tsconfig.json", kind: "file" },
  ],
  app: [
    { name: "api", kind: "dir" },
    { name: "globals.css", kind: "file" },
    { name: "layout.tsx", kind: "file" },
    { name: "page.tsx", kind: "file" },
  ],
  "app/api": [
    { name: "health", kind: "dir" },
    { name: "version", kind: "dir" },
  ],
  "app/api/health": [{ name: "route.ts", kind: "file" }],
  "app/api/version": [{ name: "route.ts", kind: "file" }],
  components: [
    { name: "ui", kind: "dir" },
    { name: "site-header.tsx", kind: "file" },
  ],
  "components/ui": ["button", "dialog", "dropdown-menu", "input", "sheet", "slider", "tooltip"].map(
    (n) => ({ name: `${n}.tsx`, kind: "file" as const }),
  ),
  convex: [
    { name: "schema.ts", kind: "file" },
    { name: "functions.ts", kind: "file" },
  ],
  frontend: [{ name: "slices", kind: "dir" }],
  "frontend/slices": [
    { name: "image-editor", kind: "dir" },
    { name: "reel-editor", kind: "dir" },
    { name: "file-explorer", kind: "dir" },
  ],
  "frontend/slices/image-editor": [
    { name: "index.ts", kind: "file" },
    { name: "image-editor.tsx", kind: "file" },
    { name: "slice.json", kind: "file" },
  ],
  "frontend/slices/reel-editor": [
    { name: "index.ts", kind: "file" },
    { name: "app.tsx", kind: "file" },
    { name: "slice.json", kind: "file" },
  ],
  "frontend/slices/file-explorer": [
    { name: "index.ts", kind: "file" },
    { name: "slice.json", kind: "file" },
  ],
  lib: [{ name: "utils.ts", kind: "file" }],
  public: [
    { name: "favicon.ico", kind: "file" },
    { name: "og.png", kind: "file" },
  ],
  node_modules: Array.from({ length: 60 }, (_, i) => ({
    name: ["react", "react-dom", "next", "konva", "sonner", "zod"][i] ?? `pkg-${String(i).padStart(2, "0")}`,
    kind: "dir" as const,
  })),
};

// node_modules/<pkg> contents resolve lazily too — same handler for all 60.
function pkgDir(): DirEntry[] {
  return [
    { name: "dist", kind: "dir" },
    { name: "package.json", kind: "file" },
    { name: "README.md", kind: "file" },
  ];
}

/** List one folder. Latency simulates a real fs/api roundtrip. */
export function listDir(path: string): Promise<DirEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (DIRS[path]) return resolve(DIRS[path]);
      if (path.startsWith("node_modules/")) return resolve(path.endsWith("/dist") ? [{ name: "index.js", kind: "file" }] : pkgDir());
      resolve([]);
    }, 160);
  });
}

/** Mock file body — fetched when a tab becomes active, dropped on close. */
export function readFile(path: string): Promise<string[]> {
  const name = path.split("/").pop() ?? path;
  const body = name.endsWith(".json")
    ? ["{", `  "name": "${name.replace(".json", "")}",`, '  "private": true', "}"]
    : name.endsWith(".css")
      ? ["@import 'tailwindcss';", "", ":root {", "  --radius: 0.625rem;", "}"]
      : [
          'import { Suspense } from "react";',
          `import { HeroSection } from "@/components/hero";`,
          "",
          `export default function ${name.replace(/\W/g, "_")}() {`,
          "  return (",
          '    <main className="min-h-screen">',
          "      <Suspense>",
          "        <HeroSection />",
          "      </Suspense>",
          "    </main>",
          "  );",
          "}",
        ];
  return new Promise((resolve) => setTimeout(() => resolve(body), 120));
}
