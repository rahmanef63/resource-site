import { defineFeature } from "@/lib/shared/features/defineFeature";

export const mdxBlogConfig = defineFeature({
  slug: "mdx-blog",
  title: "MDX Blog",
  category: "content",
  routes: [
    { path: "/blog", view: () => import("./components/list") },
  ],
  nav: { label: "Blog", group: "content", order: 0 },
});
