"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Eye, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { nid, slugify, useStore } from "../../../shared/store";
import type { Post, PostStatus } from "../../../shared/types";
import { ADMIN_BASE } from "../shell/admin-sidebar";
import { PUBLIC_BASE } from "../../../shared/ui/site-nav";

const COVERS = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=70",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=70",
  "https://images.unsplash.com/photo-1517436073-3b1d4d8b3d8a?auto=format&fit=crop&w=1400&q=70",
  "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1400&q=70",
];

const TAGS = ["Strategy", "Engineering", "Notes", "Career", "Indonesia", "AI"];

export function PostEditor({ id }: { id: string | null }) {
  const router = useRouter();
  const { state, dispatch } = useStore();

  const existing = id ? state.posts.find((p) => p.id === id) ?? null : null;

  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [slug, setSlug] = React.useState(existing?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(existing?.excerpt ?? "");
  const [body, setBody] = React.useState(
    existing?.body ??
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nPellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
  );
  const [tag, setTag] = React.useState(existing?.tag ?? TAGS[0]);
  const [cover, setCover] = React.useState(existing?.cover ?? COVERS[0]);
  const [status, setStatus] = React.useState<PostStatus>(existing?.status ?? "draft");

  // Auto-slug from title for new posts.
  React.useEffect(() => {
    if (!existing && title && !slug) setSlug(slugify(title));
  }, [title, existing, slug]);

  const readMin = Math.max(1, Math.round(body.split(/\s+/).length / 220));

  function save(nextStatus?: PostStatus) {
    if (!title) {
      toast.error("Title wajib diisi");
      return;
    }
    if (!slug) {
      toast.error("Slug wajib diisi");
      return;
    }
    const finalStatus = nextStatus ?? status;
    const post: Post = {
      id: existing?.id ?? nid("post"),
      slug,
      title,
      excerpt: excerpt || title,
      body,
      cover,
      tag,
      author: existing?.author ?? "Lorem D.",
      status: finalStatus,
      publishedAt:
        finalStatus === "published"
          ? existing?.status === "published"
            ? existing.publishedAt
            : Date.now()
          : existing?.publishedAt ?? 0,
      views: existing?.views ?? 0,
      readMin,
    };
    dispatch({ type: "post.upsert", post });
    setStatus(finalStatus);
    toast.success(
      finalStatus === "published"
        ? "Post dipublish — cek tab Public"
        : finalStatus === "scheduled"
          ? "Post dijadwalkan"
          : "Draft tersimpan",
    );
    if (!existing) router.push(`${ADMIN_BASE}/posts/${post.id}`);
  }

  function aiOutline() {
    const outline = `Hook: ${title || "Lorem opener"} — kenapa ini penting sekarang.\n\n## Section 1 — Konteks\nLorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n## Section 2 — Argumen utama\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\n## Section 3 — Implikasi\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum.\n\n## Closing\nCTA: invite reader untuk diskusi via newsletter.`;
    setBody(outline);
    toast.success("AI outline generated");
  }

  function aiHeadlines() {
    const variants = [
      "Lorem ipsum dolor sit amet — yang sering dilewatkan",
      "5 alasan kenapa lorem ipsum penting di 2026",
      "Cara kerja lorem ipsum — penjelasan untuk founder",
      "Lorem ipsum vs alternatives: panduan praktis",
    ];
    setTitle(variants[Math.floor(Math.random() * variants.length)]);
    toast.success("Headline regenerated");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="ghost" className="gap-1">
          <Link href={`${ADMIN_BASE}/posts`}><ArrowLeft className="size-3.5" /> Posts</Link>
        </Button>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">{existing ? "Edit" : "New post"}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {existing?.status === "published" && (
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link href={`${PUBLIC_BASE}/blog/${existing.slug}`} target="_top">
                <Eye className="size-3.5" /> View live
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => save("draft")} className="gap-1">
            <Save className="size-3.5" /> Save draft
          </Button>
          <Button size="sm" onClick={() => save("published")} className="gap-1">
            <ArrowUpRight className="size-3.5" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-4 p-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="h-12 border-none bg-transparent text-2xl font-semibold tracking-tight focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">/blog/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-7 w-64" />
              <Badge variant="outline" className="ml-auto rounded-full text-[10px]">{readMin} min read</Badge>
            </div>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short excerpt — appears in blog list and SEO meta."
              rows={2}
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              placeholder="Tulis isi post — paragraph dipisah dengan baris kosong."
              className="font-mono text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <Tabs defaultValue="ai">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">AI</TabsTrigger>
                  <TabsTrigger value="meta">Meta</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="mt-3 space-y-2">
                  <Button variant="outline" size="sm" className="w-full gap-1" onClick={aiOutline}>
                    <Wand2 className="size-3.5" /> Generate outline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-1" onClick={aiHeadlines}>
                    <Sparkles className="size-3.5" /> Suggest headline
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-1" disabled>
                    <Wand2 className="size-3.5" /> Adjust tone
                  </Button>
                  <p className="text-[10px] text-muted-foreground">model: claude-sonnet-4-6</p>
                </TabsContent>
                <TabsContent value="meta" className="mt-3 space-y-2 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Tag</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      className="mt-1 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    >
                      {TAGS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Cover</label>
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {COVERS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCover(c)}
                          className={
                            "aspect-video overflow-hidden rounded-md border " +
                            (c === cover ? "border-foreground" : "border-border/60 opacity-60 hover:opacity-100")
                          }
                          style={{ backgroundImage: `url(${c})`, backgroundSize: "cover", backgroundPosition: "center" }}
                          aria-label="Select cover"
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="seo" className="mt-3 space-y-2 text-sm">
                  <p className="text-xs text-muted-foreground">Meta title</p>
                  <p className="rounded border bg-muted/30 p-2 text-xs">{title || "—"}</p>
                  <p className="text-xs text-muted-foreground">Meta description</p>
                  <p className="rounded border bg-muted/30 p-2 text-xs">{excerpt || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">Auto-derived from title + excerpt.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5 text-sm">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</p>
              <div className="flex flex-wrap gap-1">
                {(["draft", "scheduled", "published"] as PostStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={
                      "rounded-full border px-3 py-1 text-xs capitalize transition " +
                      (status === s ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground hover:bg-accent")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              {existing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-start gap-1 text-rose-400 hover:bg-rose-500/10 hover:text-rose-400"
                  onClick={() => {
                    if (confirm("Delete post?")) {
                      dispatch({ type: "post.delete", id: existing.id });
                      router.push(`${ADMIN_BASE}/posts`);
                    }
                  }}
                >
                  <Trash2 className="size-3.5" /> Delete post
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
