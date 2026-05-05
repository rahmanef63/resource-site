"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtDate, usePost } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function BlogDetail({ slug }: { slug: string }) {
  const post = usePost(slug);
  if (!post) {
    return (
      <section>
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-sm text-muted-foreground">Post not found.</p>
          <Button asChild variant="ghost" className="mt-4">
            <Link href={`${PUBLIC_BASE}/blog`}><ArrowLeft className="size-4" /> Back to blog</Link>
          </Button>
        </div>
      </section>
    );
  }
  return (
    <article className="mx-auto max-w-2xl px-6 py-20">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
        <Link href={`${PUBLIC_BASE}/blog`}><ArrowLeft className="size-3.5" /> Back to blog</Link>
      </Button>
      <p className="text-xs text-muted-foreground">{fmtDate(post.publishedAt)} · {post.author}</p>
      <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
        ))}
      </div>
      <div className="prose prose-zinc mt-8 dark:prose-invert">
        {post.body.split("\n\n").map((para, i) => (
          <p key={i} className="text-base text-muted-foreground">{para}</p>
        ))}
      </div>
    </article>
  );
}
