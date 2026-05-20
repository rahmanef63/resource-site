import { defineFeature } from "@/lib/shared/features/defineFeature";

export const aiChatFeature = defineFeature({
  slug: "ai-chat",
  title: "AI Chat",
  category: "ai",
  routes: [],
  nav: { label: "AI Chat", group: "ai", icon: "MessageCircle" },
});
