import { defineFeature } from "@/lib/shared/features/defineFeature";

export const aiWorkspaceFeature = defineFeature({
  slug: "ai-workspace",
  title: "AI Workspace — chat · studio · agents",
  category: "ai",
  routes: [],
  nav: { label: "AI Workspace", group: "ai", icon: "Sparkles" },
});
