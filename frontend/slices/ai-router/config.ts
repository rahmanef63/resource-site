import { defineFeature } from "@/lib/shared/features/defineFeature";

export const aiRouterConfig = defineFeature({
  slug: "ai-router",
  title: "AI Router — Backend Provider Proxy",
  category: "ai",
  routes: [],
  nav: { label: "AI usage", group: "ai", order: 0 },
});
