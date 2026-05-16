import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hueGradient } from "./lib/colors";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  date: string;
  read: string;
  hue: number;
};

/** Renders the cover thumbnail for a blog post via deterministic HSL
 *  gradient — no image assets needed for previews. */
export function BlogThumb({
  post,
  className,
  showTag = true,
}: {
  post: BlogPost;
  className?: string;
  showTag?: boolean;
}) {
  const g = hueGradient(post.hue);
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundImage: g.bg }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: g.highlight }} />
      {showTag && (
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 bg-background/80 text-[10px] font-medium backdrop-blur"
        >
          {post.tag}
        </Badge>
      )}
    </div>
  );
}

/** Reusable blog post card. Used by blog-grid / blog-list / blog-magazine
 *  / blog-masonry / blog-featured previews. Composes shadcn Card. */
export function BlogCard({
  post,
  layout = "card",
  thumbHeightClass,
  className,
}: {
  post: BlogPost;
  /** Visual variant — card (stacked) or row (thumbnail + text). */
  layout?: "card" | "row";
  /** Override the thumbnail height class. */
  thumbHeightClass?: string;
  className?: string;
}) {
  if (layout === "row") {
    return (
      <article className={cn("group flex gap-4 sm:gap-5", className)}>
        <BlogThumb post={post} className={cn("size-20 shrink-0 rounded-xl sm:size-24", thumbHeightClass)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[10px]">{post.tag}</Badge>
            <span>·</span><span>{post.date}</span><span>·</span><span>{post.read}</span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold leading-snug group-hover:underline sm:text-base">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">{post.excerpt}</p>
          <p className="mt-1.5 text-[10px] font-medium text-muted-foreground">by {post.author}</p>
        </div>
      </article>
    );
  }
  return (
    <Card className={cn("group gap-0 overflow-hidden p-0 transition hover:shadow-md", className)}>
      <BlogThumb post={post} className={cn(thumbHeightClass ?? "h-44", "w-full")} />
      <div className="space-y-2 p-5">
        <Badge variant="secondary" className="text-[10px]">{post.tag}</Badge>
        <h3 className="text-base font-semibold leading-snug group-hover:underline sm:text-lg">{post.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        <p className="text-[10px] text-muted-foreground">{post.author} · {post.read}</p>
      </div>
    </Card>
  );
}
