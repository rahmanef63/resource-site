import { defineFeature } from "@/lib/shared/features/defineFeature";

export const subscribersFeature = defineFeature({
  slug: "subscribers",
  title: "Subscribers",
  category: "email",
  routes: [],
  nav: { label: "Subscribers", group: "email", order: 91 },
});
