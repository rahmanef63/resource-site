import { defineFeature } from "@/lib/shared/features/defineFeature";

export const pagesCmsFeature = defineFeature({
  slug: "pages-cms",
  title: "Pages CMS — block-composed multi-page editor",
  category: "content",
  routes: [],
  nav: { label: "Pages", group: "content", order: 20 },
});
