import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function isSafeRepoRelativeFile(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (path.isAbsolute(value) || value.includes("\\")) return false;
  const parts = value.split("/");
  return parts.every((part) => part.length > 0 && part !== "." && part !== "..");
}

export function rawGithubUrl(repo, branch, repoPath) {
  if (!isSafeRepoRelativeFile(repoPath)) {
    throw new Error(`Unsafe shared-file path: ${repoPath}`);
  }
  const repoParts = repo.split("/");
  if (repoParts.length !== 2 || repoParts.some((part) => !part)) {
    throw new Error(`Invalid GitHub repository: ${repo}`);
  }
  const encodedPath = repoPath.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${repoParts.map(encodeURIComponent).join("/")}/${encodeURIComponent(branch)}/${encodedPath}`;
}

export async function pullRawFile({ repo, branch, repoPath, dest, fetchImpl = globalThis.fetch }) {
  if (typeof fetchImpl !== "function") throw new Error("fetch is unavailable");
  const url = rawGithubUrl(repo, branch, repoPath);
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Could not fetch ${repoPath}: HTTP ${response.status}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, body);
}
