import { defineFeature } from "@/lib/shared/features/defineFeature";

export const databaseCellSelectionFeature = defineFeature({
  slug: "database-cell-selection",
  title: "Database Cell Selection",
  category: "ui",
  routes: [],
  nav: { label: "Database Cell Selection", group: "tools", icon: "TableProperties" },
});
