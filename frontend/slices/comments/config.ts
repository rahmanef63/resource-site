import { defineFeature } from "@/lib/shared/features/defineFeature"

export const commentsConfig = defineFeature({
  slug: "comments",
  title: "Comments — Threaded",
  category: "content",
  routes: [],
  nav: { label: "Comments", group: "tools", order: 50 },
})
