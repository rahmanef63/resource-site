import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const route = "app/preview/slices/rbac-roles/page.tsx";

describe("rbac-roles public preview route", () => {
  it("hosts the canonical preview module instead of duplicating matrix demo data", () => {
    const source = readFileSync(route, "utf8");
    expect(source).toContain('import preview from "@/features/rbac-roles/preview"');
    expect(source).toContain("preview.PermissionMatrix");
    expect(source).not.toContain("ROLE_PRESETS.map");
    expect(source).not.toContain("resolvePermissions(role)");
  });
});
