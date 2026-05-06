#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const DocumentSchema = z.object({
  title: z.string().min(1, "Document title is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  isPublic: z.boolean(),
  content: z.string().optional(),
  parentId: z.string().nullable().optional(),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z.number().optional(),
  }).optional(),
});

const documentPath = process.argv[2];
if (!documentPath) {
  console.error("Usage: validate-document.ts <document.json>");
  console.error("\nExample document.json:");
  console.error(JSON.stringify({
    title: "My Document",
    workspaceId: "k1234567890abcdef",
    isPublic: false,
    content: "Document content here",
    parentId: null,
    metadata: {
      description: "Optional description",
      tags: ["tag1", "tag2"],
      version: 1
    }
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(documentPath, "utf-8");
  const data = JSON.parse(raw);
  DocumentSchema.parse(data);

} catch (err: unknown) {
  console.error("✗ Document payload is invalid:");
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
