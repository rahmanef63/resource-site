import { defineFeature } from "@/lib/shared/features/defineFeature";

export const aiStudioFeature = defineFeature({
  slug: "ai-studio",
  title: "AI Studio — Generation Canvas",
  category: "ai",
  routes: [],
  nav: { label: "AI Studio", group: "ai", icon: "Sparkles" },
});
