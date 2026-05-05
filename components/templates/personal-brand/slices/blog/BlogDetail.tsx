"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  aiFlag,
  fmtDate,
  nid,
  rel,
  usePost,
  usePostComments,
  usePublishedPosts,
  useStore,
} from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/ui/site-nav";
import { NewsletterBlock } from "../home/NewsletterBlock";

export function BlogDetail({ slug }: { slug: string }) {
  const post = usePost(slug);
  const router = useRouter();
  const { dispatch } = useStore();
  const allPosts = usePublishedPosts();

  React.useEffect(() => {
    if (post) dispatch({ type: "post.view", id: post.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  if (!post) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <p className="text-sm text-muted-foreground">Post tidak ditemukan.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`${PUBLIC_BASE}/blog`}><ArrowLeft className="size-4" /> Kembali ke blog</Link>
        </Button>
      </section>
    );
  }

  if (post.status !== "published") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium text-amber-300">Draft preview</p>
            <p className="mt-1 text-xs text-muted-foreground">Post ini belum dipublish — hanya admin yang bisa lihat.</p>
            <Button asChild variant="outline" className="mt-4" onClick={() => router.back()}>
              <Link href={`${PUBLIC_BASE}/blog`}>Kembali ke blog</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const related = allPosts.filter((p) => p.id !== post.id && p.tag === post.tag).slice(0, 3);
  const paragraphs = post.body.split(/\n\n+/);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-6 gap-1">
        <Link href={`${PUBLIC_BASE}/blog`}>
          <ArrowLeft className="size-3.5" /> All posts
        </Link>
      </Button>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full">{post.tag}</Badge>
          <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {fmtDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {post.readMin} min read</span>
          <span>·</span>
          <span>{post.views.toLocaleString()} views</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{post.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
      </header>

      <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-xl border border-border/60">
        <Image src={post.cover} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
      </div>

      <div className="prose prose-invert max-w-none">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-foreground/85">{p}</p>
        ))}
      </div>

      <CommentSection postId={post.id} postTitle={post.title} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">Related</h2>
          <ul className="mt-3 space-y-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`${PUBLIC_BASE}/blog/${r.slug}`}
                  className="flex items-center justify-between rounded-md border border-border/60 p-3 hover:bg-accent"
                >
                  <span className="text-sm">{r.title}</span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <NewsletterBlock source={`post:${post.slug}`} />
    </article>
  );
}

function CommentSection({ postId, postTitle }: { postId: string; postTitle: string }) {
  const comments = usePostComments(postId);
  const { dispatch } = useStore();
  const [author, setAuthor] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [body, setBody] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author || !email.includes("@") || body.length < 4) {
      toast.error("Lengkapi nama, email, dan komentar minimal 4 karakter");
      return;
    }
    const flag = aiFlag(body);
    dispatch({
      type: "comment.create",
      comment: {
        id: nid("com"),
        postId,
        postTitle,
        author,
        email,
        body,
        status: flag === "spam" ? "spam" : "pending",
        aiFlag: flag,
        ts: Date.now(),
      },
    });
    toast.success(
      flag === "spam"
        ? "Komentar masuk antrian moderasi (terdeteksi spam)"
        : "Komentar terkirim — menunggu moderasi admin",
    );
    setBody("");
  }

  return (
    <section className="mt-16 border-t border-border/60 pt-10">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <MessageSquare className="size-4" />
        Comments ({comments.length})
      </h2>

      <ul className="mt-4 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada komentar — jadilah yang pertama.</p>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded-md border border-border/60 bg-card/40 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="grid size-7 place-items-center rounded-full bg-muted text-[11px]">
                {c.author.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{c.author}</span>
              <span>· {rel(c.ts)}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nama" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" type="email" />
        </div>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tulis komentar…" rows={4} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground">
            AI moderation aktif. Comment akan masuk antrian sebelum tampil.
          </p>
          <Button type="submit" size="sm" className="gap-1">
            <Send className="size-3.5" /> Kirim komentar
          </Button>
        </div>
      </form>
    </section>
  );
}
