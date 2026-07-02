// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("tasks layout contract", () => {
  it("mounts the shared FeatureShell with featureId=tasks", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/tasks/views/TasksPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="tasks"');
  });
});
