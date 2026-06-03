// `mdx-blog` slice config — v0.2.0 portable factory.
//
// Per docs/contract-negotiations-2026-05-15.md §2: the `mdx-blog` slice is
// MDX-only. UP-synced from content-rahmanef-com (commit `c6729a5`,
// Wave N+3.1) on 2026-05-15.
//
// Replaces the v0.1.0 hardcoded `defineFeature(...)` instance with a
// `defineMdxBlog(opts)` factory + a default-prop `mdxBlogConfig` instance
// that preserves the legacy "/blog" + "content/blog" + "Blog" surface so
// existing template wirings keep working.
//
// 4 portable config props (all optional, all defaulted):
//   - basePath      — route base for the list page (default "/blog")
//   - contentDir    — filesystem glob root (default "content/blog")
//   - labels.list   — page heading + nav label (default "Blog")
//   - nav.{group,order} — sidebar grouping override (default content / 0)
import {
  defineFeature,
  type SliceNavEntry,
} from "@/lib/shared/features/defineFeature";

export type MdxBlogOptions = {
  /** Route base path. Default: "/blog" */
  basePath?: string;
  /** Filesystem glob root for MDX files. Default: "content/blog" */
  contentDir?: string;
  /** Display strings for nav + page heading. */
  labels?: {
    /** Nav label + page heading. Default: "Blog" */
    list?: string;
  };
  /** Nav grouping override. */
  nav?: {
    group?: SliceNavEntry["group"];
    order?: number;
  };
};

export const MDX_BLOG_DEFAULTS = {
  basePath: "/blog",
  contentDir: "content/blog",
  labels: { list: "Blog" },
  nav: { group: "content", order: 0 },
} as const;

export function resolveMdxBlogOptions(opts: MdxBlogOptions = {}) {
  return {
    basePath: opts.basePath ?? MDX_BLOG_DEFAULTS.basePath,
    contentDir: opts.contentDir ?? MDX_BLOG_DEFAULTS.contentDir,
    labels: { list: opts.labels?.list ?? MDX_BLOG_DEFAULTS.labels.list },
    nav: {
      group: opts.nav?.group ?? MDX_BLOG_DEFAULTS.nav.group,
      order: opts.nav?.order ?? MDX_BLOG_DEFAULTS.nav.order,
    },
  } as const;
}

export function defineMdxBlog(opts: MdxBlogOptions = {}) {
  const r = resolveMdxBlogOptions(opts);
  return defineFeature({
    slug: "mdx-blog",
    title: "MDX Blog",
    category: "content",
    routes: [{ path: r.basePath, view: () => import("./components/list") }],
    nav: { label: r.labels.list, group: r.nav.group, order: r.nav.order },
  });
}

/** Default-prop instance — preserves legacy v0.1.0 surface for back-compat. */
export const mdxBlogConfig = defineMdxBlog();
