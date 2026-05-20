import { defineFeature } from "@/lib/shared/features/defineFeature";

export const aiAgentsFeature = defineFeature({
  slug: "ai-agents",
  title: "AI Agents",
  category: "ai",
  routes: [],
  nav: { label: "AI Agents", group: "ai", icon: "Bot" },
});
