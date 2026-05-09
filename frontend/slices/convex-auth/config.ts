import { defineFeature } from "@/lib/shared/features/defineFeature";

export const convexAuthConfig = defineFeature({
  slug: "convex-auth",
  title: "Convex Auth — Email Magic Link",
  category: "auth",
  routes: [
    { path: "/sign-in", view: () => import("./components/sign-in-page") },
  ],
  nav: { label: "Sign in", group: "auth", order: 0 },
});
