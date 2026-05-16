import { defineFeature } from "@/lib/shared/features/defineFeature";

export const createYourMcpFeature = defineFeature({
  slug: "create-your-mcp",
  title: "Create Your MCP",
  category: "ai",
  routes: [],
  nav: { label: "MCP", group: "ai", order: 60 },
});
