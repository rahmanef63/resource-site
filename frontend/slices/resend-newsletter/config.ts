import { defineFeature } from "@/lib/shared/features/defineFeature";

export const resendNewsletterConfig = defineFeature({
  slug: "resend-newsletter",
  title: "Resend — Transactional & Newsletter",
  category: "integrations",
  routes: [
    { path: "/newsletter", view: () => import("./components/subscribe-form") },
  ],
  nav: { label: "Newsletter", group: "integrations", order: 0 },
});
