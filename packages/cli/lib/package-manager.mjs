import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const SUPPORTED_PACKAGE_MANAGERS = ["npm", "bun", "pnpm", "yarn"];

export function normalizePackageManager(value) {
  if (!value) return undefined;
  const pm = String(value).trim().toLowerCase();
  if (!SUPPORTED_PACKAGE_MANAGERS.includes(pm)) {
    throw new Error(`Unsupported package manager "${value}". Available: npm, bun, pnpm, yarn.`);
  }
  return pm;
}

export function detectPackageManager(target, explicit) {
  const override = normalizePackageManager(explicit);
  if (override) return override;

  const pkg = readJson(path.join(target, "package.json"));
  const declared = String(pkg?.packageManager ?? "").split("@")[0];
  if (SUPPORTED_PACKAGE_MANAGERS.includes(declared)) return declared;

  const rr = readJson(path.join(target, "rr.json"));
  if (SUPPORTED_PACKAGE_MANAGERS.includes(rr?.packageManager)) return rr.packageManager;

  if (existsSync(path.join(target, "bun.lock")) || existsSync(path.join(target, "bun.lockb"))) return "bun";
  if (existsSync(path.join(target, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(target, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(target, "package-lock.json"))) return "npm";
  return "npm";
}

export function packageExecutor(pm) {
  return pm === "bun" ? "bunx" : pm === "pnpm" ? "pnpm dlx" : pm === "yarn" ? "yarn dlx" : "npx";
}

export function installAllSpec(pm) {
  if (pm === "npm") return { cmd: "npm", args: ["install", "--legacy-peer-deps", "--include=dev"] };
  return { cmd: pm, args: ["install"] };
}

export function addDependenciesSpec(pm, deps) {
  return pm === "npm"
    ? { cmd: "npm", args: ["install", ...deps] }
    : { cmd: pm, args: ["add", ...deps] };
}

export function runScriptText(pm, script) {
  return pm === "npm" ? `npm run ${script}` : `${pm} run ${script}`;
}

export function execText(pm, pkgAndArgs) {
  return `${packageExecutor(pm)} ${pkgAndArgs}`;
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}
