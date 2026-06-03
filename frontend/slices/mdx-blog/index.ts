// Slice public barrel — re-exports the portable surface.
export {
  defineMdxBlog,
  mdxBlogConfig,
  resolveMdxBlogOptions,
  MDX_BLOG_DEFAULTS,
} from "./config";
export type { MdxBlogOptions } from "./config";
export { default as BlogList } from "./components/list";
export type { BlogListProps } from "./components/list";
