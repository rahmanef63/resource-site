import { defineFeature } from "@/lib/shared/features/defineFeature";

export const publisherCleanHtmlFeature = defineFeature({
  slug: "publisher-clean-html",
  title: "Publisher — clean HTML",
  category: "content",
  routes: [],
  nav: { label: "Publisher", group: "content", order: 41 },
});
