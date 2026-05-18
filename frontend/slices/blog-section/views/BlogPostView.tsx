import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { PostMeta } from "../components/PostMeta";
import type { BlogPost } from "./BlogListSection";

export type BlogPostViewProps = {
  post: BlogPost;
  /** "All posts" link. */
  backHref?: string;
  /** Render markdown/plain body. Default: split body on \n\n into <p>. */
  renderBody?: (body: string) => ReactNode;
  className?: string;
};

function defaultRenderBody(body: string): ReactNode {
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p, i) => (
    <p key={i} className="mb-4 text-base leading-relaxed text-foreground/90 last:mb-0">
      {p}
    </p>
  ));
}

export function BlogPostView({
  post,
  backHref,
  renderBody,
  className,
}: BlogPostViewProps) {
  const body = post.body ?? "";
  const render = renderBody ?? defaultRenderBody;

  return (
    <article className={cn("w-full px-6 py-16 md:py-24", className)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {backHref ? (
          <Button asChild variant="link" size="sm" className="h-auto self-start p-0">
            <Link href={backHref}>&larr; All posts</Link>
          </Button>
        ) : null}

        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
            {post.title}
          </h1>
          <PostMeta
            author={post.author}
            publishedAt={post.publishedAt}
            tags={post.tags}
            maxTags={8}
          />
        </header>

        {post.cover ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        {post.excerpt ? (
          <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        ) : null}

        <Separator />

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          {body ? render(body) : (
            <p className="text-sm text-muted-foreground">No content.</p>
          )}
        </div>
      </div>
    </article>
  );
}
