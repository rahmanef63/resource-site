import { describe, it, expect } from "vitest";
import {
  MDX_BLOG_DEFAULTS,
  resolveMdxBlogOptions,
  defineMdxBlog,
  mdxBlogConfig,
} from "./config";

/**
 * v0.2.0 portable factory contract — locks the 4-prop surface UP-synced
 * from content-rahmanef-com (Wave N+3.1 / commit `c6729a5`). A future
 * rename of any prop or default trips a test before slipping past review.
 *
 * Per docs/contract-negotiations-2026-05-15.md §2.
 */
describe("mdx-blog config — v0.2.0 factory", () => {
  describe("MDX_BLOG_DEFAULTS", () => {
    it("ships the legacy /blog + content/blog + Blog surface", () => {
      expect(MDX_BLOG_DEFAULTS.basePath).toBe("/blog");
      expect(MDX_BLOG_DEFAULTS.contentDir).toBe("content/blog");
      expect(MDX_BLOG_DEFAULTS.labels.list).toBe("Blog");
      expect(MDX_BLOG_DEFAULTS.nav.group).toBe("content");
      expect(MDX_BLOG_DEFAULTS.nav.order).toBe(0);
    });
  });

  describe("resolveMdxBlogOptions", () => {
    it("returns all defaults when given no opts", () => {
      const r = resolveMdxBlogOptions();
      expect(r.basePath).toBe("/blog");
      expect(r.contentDir).toBe("content/blog");
      expect(r.labels.list).toBe("Blog");
      expect(r.nav.group).toBe("content");
      expect(r.nav.order).toBe(0);
    });

    it("overrides only the props provided, keeping defaults for the rest", () => {
      const r = resolveMdxBlogOptions({
        basePath: "/writing",
        labels: { list: "Articles" },
      });
      expect(r.basePath).toBe("/writing");
      expect(r.labels.list).toBe("Articles");
      // untouched defaults
      expect(r.contentDir).toBe("content/blog");
      expect(r.nav.group).toBe("content");
      expect(r.nav.order).toBe(0);
    });

    it("accepts a full nav override", () => {
      const r = resolveMdxBlogOptions({
        contentDir: "src/content/posts",
        nav: { group: "tools", order: 9 },
      });
      expect(r.contentDir).toBe("src/content/posts");
      expect(r.nav.group).toBe("tools");
      expect(r.nav.order).toBe(9);
    });
  });

  describe("defineMdxBlog factory", () => {
    it("produces a feature config with default routes/nav", () => {
      const cfg = defineMdxBlog();
      expect(cfg.slug).toBe("mdx-blog");
      expect(cfg.title).toBe("MDX Blog");
      expect(cfg.category).toBe("content");
      expect(cfg.routes?.[0]?.path).toBe("/blog");
      expect(cfg.nav?.label).toBe("Blog");
      expect(cfg.nav?.group).toBe("content");
      expect(cfg.nav?.order).toBe(0);
    });

    it("propagates basePath into the route entry (prop-driven branch)", () => {
      const cfg = defineMdxBlog({ basePath: "/notes" });
      expect(cfg.routes?.[0]?.path).toBe("/notes");
    });

    it("propagates labels.list into the nav label (prop-driven branch)", () => {
      const cfg = defineMdxBlog({ labels: { list: "Journal" } });
      expect(cfg.nav?.label).toBe("Journal");
    });
  });

  describe("mdxBlogConfig default-prop instance", () => {
    it("is the same shape as defineMdxBlog() with no args", () => {
      expect(mdxBlogConfig.slug).toBe("mdx-blog");
      expect(mdxBlogConfig.routes?.[0]?.path).toBe("/blog");
      expect(mdxBlogConfig.nav?.label).toBe("Blog");
    });
  });
});
