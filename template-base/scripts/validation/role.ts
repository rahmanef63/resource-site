#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const RoleSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  name: z.string().min(1, "Role name is required"),
  level: z.number().int().min(0).max(99, "Role level must be between 0 and 99"),
  permissions: z.array(z.string()).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex color").optional(),
  isDefault: z.boolean().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

const rolePath = process.argv[2];
if (!rolePath) {
  console.error("Usage: validate-role.ts <role.json>");
  console.error("\nExample role.json:");
  console.error(JSON.stringify({
    workspaceId: "k1234567890abcdef",
    name: "Editor",
    level: 40,
    permissions: ["documents:create", "documents:edit", "view:workspace"],
    color: "#3b82f6",
    isDefault: false,
    icon: "Edit",
    description: "Can create and edit documents"
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(rolePath, "utf-8");
  const data = JSON.parse(raw);
  RoleSchema.parse(data);

} catch (err: unknown) {
  console.error("✗ Role payload is invalid:");
  if (err instanceof z.ZodError) {
    err.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
  } else if (err instanceof Error) {
    console.error(`  ${err.message}`);
  } else {
    console.error(err);
  }
  process.exit(1);
}
