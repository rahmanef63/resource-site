// Stub MDX list — replace with a real `getAllPosts()` glob + Card grid.
//
// v0.2.0 — accepts `title` + `contentDir` props for portability. Defaults
// pulled from MDX_BLOG_DEFAULTS so a no-prop call site renders the legacy
// "Blog" + "content/blog" surface.

import { Card } from "@/components/ui/card";
import { MDX_BLOG_DEFAULTS } from "../config";

export type BlogListProps = {
  /** Heading shown above the list. Default: "Blog". */
  title?: string;
  /** Filesystem root for MDX files (relative to repo root). Default: "content/blog". */
  contentDir?: string;
};

export default function BlogList({
  title = MDX_BLOG_DEFAULTS.labels.list,
  contentDir = MDX_BLOG_DEFAULTS.contentDir,
}: BlogListProps = {}) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <Card className="p-4 text-sm text-muted-foreground">
        Drop MDX files in <code>{contentDir}/*.mdx</code>; replace this stub with a glob loader + list grid.
      </Card>
    </main>
  );
}
