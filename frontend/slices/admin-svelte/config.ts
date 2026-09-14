export type AdminSvelteFeature = {
  slug: "admin";
  title: string;
  category: "infra";
  variants: readonly ["shell", "console"];
};

export const adminSvelteFeature: AdminSvelteFeature = {
  slug: "admin",
  title: "Admin — generic shell + composed console",
  category: "infra",
  variants: ["shell", "console"],
};
