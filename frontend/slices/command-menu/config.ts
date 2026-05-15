import { defineFeature } from "@/lib/shared/features/defineFeature";

export const commandMenuConfig = defineFeature({
  slug: "command-menu",
  title: "Command Menu",
  category: "ui",
  routes: [],
  nav: { label: "Command Menu", group: "tools", icon: "Command", order: 10 },
});
