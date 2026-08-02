import { defineFeature } from "@/lib/shared/features/defineFeature"

// ai-core ships no routes — it's the shared UI/helper substrate the ai-* cluster
// imports. Kept as a feature so the registry + manifest tooling can track it.
export const aiCoreConfig = defineFeature({
  slug: "ai-core",
  title: "AI Core Kit",
  category: "ui",
  routes: [],
})
