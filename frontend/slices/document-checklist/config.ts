import { defineFeature } from "@/lib/shared/features/defineFeature"

// Document Checklist — job-search doc tracker with country templates.
// Surfaces under /checklist in the consumer app; consumer wires the route.
export const documentChecklistConfig = defineFeature({
  slug: "document-checklist",
  title: "Document Checklist — Job-Search Doc Tracker",
  category: "content",
  routes: [],
  nav: {
    label: "Ceklis Dokumen",
    group: "tools",
    icon: "ListChecks",
    order: 40,
  },
  peers: [{ slug: "convex-auth", range: "^0.1" }],
})
