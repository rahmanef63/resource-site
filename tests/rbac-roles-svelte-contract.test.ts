import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "frontend/slices/rbac-roles-svelte";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

describe("rbac-roles Svelte distribution contract", () => {
  it("stays native Svelte without React/Next/Lucide/shadcn leakage", () => {
    const source = sourceFiles(root)
      .filter((path) => /\.(ts|svelte)$/.test(path))
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    expect(source).not.toMatch(/from ["']react["']/);
    expect(source).not.toMatch(/from ["']next\//);
    expect(source).not.toContain("lucide-react");
    expect(source).not.toContain("@/components/ui/");
  });

  it("shares the canonical RBAC engine and agent tools", () => {
    const manifest = JSON.parse(readFileSync(`${root}/slice.manifest.json`, "utf8"));
    expect(manifest.imports.shared).toEqual([
      "frontend/slices/rbac-roles/lib/permissions.ts",
      "frontend/slices/rbac-roles/lib/roles.ts",
      "frontend/slices/rbac-roles/lib/check.ts",
      "frontend/slices/rbac-roles/lib/permission-catalog.ts",
      "frontend/slices/rbac-roles/lib/api.ts",
      "frontend/slices/rbac-roles/lib/tools.ts",
    ]);
  });

  it("keeps gate, role preset, and superadmin matrix semantics visible in the adapter", () => {
    const gate = readFileSync(`${root}/components/PermissionGate.svelte`, "utf8");
    const badge = readFileSync(`${root}/components/RoleBadge.svelte`, "utf8");
    const matrix = readFileSync(`${root}/components/PermissionMatrix.svelte`, "utf8");
    expect(gate).toContain("hasPermission(permissions, permission)");
    expect(badge).toContain("ROLE_MAP.get(role)");
    expect(matrix).toContain('value.includes("*")');
    expect(matrix).toContain("matchPermission(permission, key)");
  });
});
