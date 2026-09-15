export type PublicFrameworkId = "react-next" | "svelte-sveltekit";
export type PublicPackageManager = "npm" | "bun";

export type FrameworkProfile = {
  id: PublicFrameworkId;
  cliValue: "react-next" | "sveltekit";
  label: string;
  runtime: string;
  renderer: string;
  default: boolean;
  accent: string;
  note: string;
};

export const FRAMEWORK_PROFILES: readonly FrameworkProfile[] = [
  {
    id: "react-next",
    cliValue: "react-next",
    label: "Next.js",
    runtime: "Next.js 16",
    renderer: "React 19",
    default: true,
    accent: "Next + React",
    note: "Default distribution. Full-app templates and every active slice support this path.",
  },
  {
    id: "svelte-sveltekit",
    cliValue: "sveltekit",
    label: "SvelteKit",
    runtime: "SvelteKit 2",
    renderer: "Svelte 5",
    default: false,
    accent: "SvelteKit + Svelte",
    note: "Explicit distribution with SvelteKit 2, Svelte 5, adapter-node and convex-svelte. All 66 canonical active slices support this path; six legacy compatibility entries remain React-only.",
  },
] as const;

export type PackageManagerProfile = {
  id: PublicPackageManager;
  label: string;
  exec: "npx" | "bunx";
  install: string;
  run: (script: string) => string;
};

export const PACKAGE_MANAGER_PROFILES: readonly PackageManagerProfile[] = [
  { id: "npm", label: "npm", exec: "npx", install: "npm install", run: (script) => `npm run ${script}` },
  { id: "bun", label: "Bun", exec: "bunx", install: "bun install", run: (script) => `bun run ${script}` },
] as const;

export function getFrameworkProfile(id: PublicFrameworkId) {
  return FRAMEWORK_PROFILES.find((item) => item.id === id)!;
}

export function getPackageManagerProfile(id: PublicPackageManager) {
  return PACKAGE_MANAGER_PROFILES.find((item) => item.id === id)!;
}

export function rrExec(pm: PublicPackageManager) {
  return getPackageManagerProfile(pm).exec;
}

export function sliceInstallCommand(slug: string, framework: PublicFrameworkId, pm: PublicPackageManager) {
  const f = getFrameworkProfile(framework);
  return `${rrExec(pm)} rahman-resources@latest add ${slug}${framework === "react-next" ? "" : ` --framework ${f.cliValue}`}`;
}
