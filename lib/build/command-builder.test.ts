import { describe, expect, it } from "vitest";
import { buildAddCommands, buildInitCommand, EXISTING_PROJECT_SLUG } from "./command-builder";
import type { BuildSelection } from "./types";

function selection(overrides: Partial<BuildSelection> = {}): BuildSelection {
  return {
    template: null,
    features: [],
    slices: [],
    skills: [],
    project: {
      appName: "my-app",
      brandName: "",
      ownerEmail: "",
      framework: "react-next",
      packageManager: "npm",
    },
    ...overrides,
  };
}

describe("Bundle Builder framework/package-manager commands", () => {
  it("emits explicit Next/npm init metadata", () => {
    const block = buildInitCommand(selection({ slices: ["appshell"] }));
    expect(block.script).toContain("npx rahman-resources@latest init my-app");
    expect(block.script).toContain("--framework react-next");
    expect(block.script).toContain("--package-manager npm");
    expect(block.script).toContain("npx rahman-resources@latest add appshell --package-manager npm");
  });

  it("emits SvelteKit+Bun for both scaffold and slice installs", () => {
    const sel = selection({
      slices: ["appshell"],
      project: { appName: "svelte-app", brandName: "", ownerEmail: "", framework: "svelte-sveltekit", packageManager: "bun" },
    });
    const block = buildInitCommand(sel);
    expect(block.script).toContain("bunx rahman-resources@latest init svelte-app");
    expect(block.script).toContain("--framework sveltekit");
    expect(block.script).toContain("--package-manager bun");
    expect(block.script).toContain("bunx rahman-resources@latest add appshell --framework sveltekit --package-manager bun");
  });

  it("uses uploaded existing-project environment for add commands", () => {
    const sel = selection({
      template: EXISTING_PROJECT_SLUG,
      slices: ["appshell"],
      project: { appName: "ignored", brandName: "", ownerEmail: "", framework: "svelte-sveltekit", packageManager: "bun" },
    });
    const block = buildAddCommands(sel, { framework: "sveltekit", packageManager: "bun", slices: [] });
    expect(block.script).toContain("bunx rahman-resources@latest add appshell --framework sveltekit --package-manager bun");
  });
});
