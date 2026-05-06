#!/usr/bin/env node
import { z } from "zod";
import { readFileSync } from "fs";

const ConversationSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  type: z.enum(["personal", "group", "ai"]),
  name: z.string().optional(),
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
  metadata: z.object({
    description: z.string().optional(),
    avatar: z.string().optional(),
    aiModel: z.string().optional(),
    systemPrompt: z.string().optional(),
    isFavorite: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    isMuted: z.boolean().optional(),
    labels: z.array(z.string()).optional(),
  }).optional(),
}).refine((data) => {
  if (data.type === "personal" && data.participantIds.length !== 1) {
    return false;
  }
  return true;
}, {
  message: "Personal conversations must have exactly 1 participant (other than creator)",
  path: ["participantIds"],
});

const conversationPath = process.argv[2];
if (!conversationPath) {
  console.error("Usage: validate-conversation.ts <conversation.json>");
  console.error("\nExample conversation.json:");
  console.error(JSON.stringify({
    workspaceId: "k1234567890abcdef",
    type: "group",
    name: "Project Team",
    participantIds: ["k2222222222222222", "k3333333333333333"],
    metadata: {
      description: "Team discussion",
      isFavorite: true,
      labels: ["work", "urgent"]
    }
  }, null, 2));
  process.exit(1);
}

try {
  const raw = readFileSync(conversationPath, "utf-8");
  const data = JSON.parse(raw);
  ConversationSchema.parse(data);

  if (data.name) console.log(`  Name: ${data.name}`);
  if (data.metadata?.aiModel) console.log(`  AI Model: ${data.metadata.aiModel}`);
} catch (err: unknown) {
  console.error("✗ Conversation payload is invalid:");
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
