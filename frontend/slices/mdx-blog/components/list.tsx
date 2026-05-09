// Stub blog list — replace with a real `getAllPosts()` glob + Card grid.

import { Card } from "@/components/ui/card";

export default function BlogList() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <Card className="p-4 text-sm text-muted-foreground">
        Drop MDX files in <code>content/blog/*.mdx</code>; replace this stub with a glob loader + list grid.
      </Card>
    </main>
  );
}
