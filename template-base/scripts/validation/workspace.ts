#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const WorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  type: z.enum(["organization", "institution", "group", "family", "personal"]),
  isPublic: z.boolean(),
  description: z.string().optional(),
  organizationId: z.string().optional(),
  selectedMenuSlugs: z.array(z.string()).optional(),
});

const workspacePath = process.argv[2];
if (!workspacePath) {
  console.error("Usage: validate-workspace.ts <workspace.json>");
  console.error("\nExample workspace.json:");
  console.error(JSON.stringify({
    name: "My Workspace",
    slug: "my-workspace",
    type: "personal",
    isPublic: false,
    description: "Optional description",
    selectedMenuSlugs: ["chat", "documents"]
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(workspacePath, "utf-8");
  const data = JSON.parse(raw);
  WorkspaceSchema.parse(data);

} catch (err: unknown) {
  console.error("✗ Workspace payload is invalid:");
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
