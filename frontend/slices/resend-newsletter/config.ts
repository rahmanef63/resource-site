import { defineFeature } from "@/lib/shared/features/defineFeature";

export const resendNewsletterConfig = defineFeature({
  slug: "resend-newsletter",
  title: "Resend — Transactional & Newsletter",
  category: "email",
  routes: [
    { path: "/newsletter", view: () => import("./components/subscribe-form") },
  ],
  nav: { label: "Newsletter", group: "email", order: 0 },
});
