// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const dockerfile = readFileSync("Dockerfile", "utf8");
const sanitize = JSON.parse(readFileSync("node_modules/sanitize-html/package.json", "utf8"));

describe("production Node runtime contract", () => {
  it("uses Node 22 for both site build and runner because patched sanitize-html requires it", () => {
    const bases = [...dockerfile.matchAll(/^FROM node:(\d+)-alpine(?: AS \w+)?$/gm)].map((match) => Number(match[1]));
    expect(bases).toEqual([22, 22]);
    expect(sanitize.version).toBe("2.17.7");
    expect(sanitize.engines?.node).toContain(">=22.12.0");
  });

  it("keeps production site context free of tests and MCP package source", () => {
    const dockerignore = readFileSync(".dockerignore", "utf8");
    expect(dockerignore.split(/\r?\n/)).toContain("tests");
    expect(dockerignore.split(/\r?\n/)).toContain("packages");
  });

  it("keeps the standalone MCP container independent on its own Node base", () => {
    const mcpDockerfile = readFileSync("packages/mcp/Dockerfile", "utf8");
    expect(mcpDockerfile).toContain("FROM node:20-alpine");
  });
});
