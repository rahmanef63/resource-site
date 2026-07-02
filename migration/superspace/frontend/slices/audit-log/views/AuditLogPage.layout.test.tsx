// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("audit-log layout contract", () => {
  it("mounts the shared FeatureShell with featureId=audit-log", () => {
    const source = readFileSync(resolve(process.cwd(), "frontend/slices/audit-log/views/AuditLogPage.tsx"), "utf8");
    expect(source).toMatch(/FeatureShell|FeatureThreeColumnLayout/);
    expect(source).toContain('featureId="audit-log"');
  });
});
