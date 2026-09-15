export const convexAuthConfig = {
  slug: "convex-auth",
  title: "Convex Auth — Multi-Provider Sign-in",
  category: "auth",
  routes: [{ path: "/sign-in", view: "SignInPage" }],
  nav: { label: "Sign in", group: "auth", order: 0 },
} as const;
