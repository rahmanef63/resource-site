export type AppRuntime = "html" | "node" | "python" | "shell";

export const APP_RUNTIMES: { value: AppRuntime; label: string }[] = [
  { value: "html", label: "HTML" },
  { value: "node", label: "Node" },
  { value: "python", label: "Python" },
  { value: "shell", label: "Shell" },
];

export const DEFAULT_ENTRY: Record<AppRuntime, string> = {
  html: "index.html",
  node: "main.js",
  python: "app.py",
  shell: "run.sh",
};

export const APP_GRADIENTS = [
  "linear-gradient(160deg,#22d3ee,#0891b2)",
  "linear-gradient(160deg,#a855f7,#6d28d9)",
  "linear-gradient(160deg,#f43f5e,#be123c)",
  "linear-gradient(160deg,#f59e0b,#d97706)",
  "linear-gradient(160deg,#34d058,#16a34a)",
  "linear-gradient(160deg,#6366f1,#4338ca)",
] as const;

export function slugifyAppName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function appManifestJson(input: {
  name: string;
  runtime: AppRuntime;
  entry: string;
  glyph: string;
  gradient: string;
}): string {
  const appId = slugifyAppName(input.name) || "untitled";
  return JSON.stringify(
    { appId, title: input.name.trim() || "New app", runtime: input.runtime, entry: input.entry, glyph: input.glyph, gradient: input.gradient },
    null,
    2,
  );
}
