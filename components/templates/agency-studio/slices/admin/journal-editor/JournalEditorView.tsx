"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { nid, useStore } from "../../../shared/store";
import type { Article } from "../../../shared/types";
import { ADMIN_BASE, PUBLIC_BASE } from "../../../shared/nav-config";
import { JournalEditorSidebar } from "./JournalEditorSidebar";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function JournalEditorView({ id }: { id: string | null }) {
  const router = useRouter();
  const { state, dispatch } = useStore();

  const existing = id && id !== "new" ? state.articles.find((a) => a.id === id) ?? null : null;

  const [title, setTitle] = React.useState(existing?.title ?? "");
  const [slug, setSlug] = React.useState(existing?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(existing?.excerpt ?? "");
  const [body, setBody] = React.useState(
    existing?.body ??
      "Hook: satu kalimat positioning yang tim sales bisa pakai besok.\n\nKonteks dan setup masalah — tulis sebagai pengamatan, bukan opini.\n\nArgumen utama + trade-off yang Anda pilih.\n\nClosing: invite reader untuk diskusi via email atau newsletter.",
  );
  const [category, setCategory] = React.useState<Article["category"]>(existing?.category ?? "essay");
  const [status, setStatus] = React.useState<NonNullable<Article["status"]>>(existing?.status ?? "draft");
  const [heroEmoji, setHeroEmoji] = React.useState(existing?.heroEmoji ?? "📐");
  const [tags, setTags] = React.useState<string[]>(existing?.tags ?? ["essay", "studio-ops"]);
  const [featured, setFeatured] = React.useState(existing?.featured ?? false);

  React.useEffect(() => {
    if (!existing && title && !slug) setSlug(slugify(title));
  }, [title, existing, slug]);

  const readMinutes = Math.max(1, Math.round(body.split(/\s+/).length / 220));

  const save = (next?: NonNullable<Article["status"]>) => {
    if (!title.trim()) { toast.error("Title wajib diisi"); return; }
    if (!slug.trim()) { toast.error("Slug wajib diisi"); return; }
    const finalStatus = next ?? status;
    const article: Article = {
      id: existing?.id ?? nid("art"),
      slug,
      title,
      excerpt: excerpt || title,
      body,
      category,
      author: existing?.author ?? "Asti R.",
      readMinutes,
      publishedAt:
        finalStatus === "published"
          ? existing?.status === "published" ? existing.publishedAt : Date.now()
          : existing?.publishedAt ?? 0,
      cover: existing?.cover,
      featured,
      heroEmoji,
      tags,
      status: finalStatus,
    };
    dispatch({ type: "article.upsert", article });
    setStatus(finalStatus);
    toast.success(finalStatus === "published" ? "Artikel dipublish" : "Draft tersimpan");
    if (!existing) router.push(`${ADMIN_BASE}/journal-editor/${article.id}`);
  };

  const onAiOutline = () => {
    setBody(
      `Hook: ${title || "Sebuah pengamatan dari studio"} — kenapa ini penting sekarang.\n\n` +
        `## Konteks\nSetup ringkas: apa yang berubah di pasar / di tim klien.\n\n` +
        `## Argumen\nSatu klaim utama + dua trade-off yang Anda pilih.\n\n` +
        `## Implikasi\nApa yang harus berubah di workflow tim Anda minggu depan.\n\n` +
        `## Closing\nInvite ke diskusi via email — siapa yang sudah coba pendekatan serupa?`,
    );
    toast.success("AI outline generated");
  };

  const onDelete = () => {
    if (!existing) return;
    if (!confirm("Hapus artikel?")) return;
    dispatch({ type: "article.delete", id: existing.id });
    router.push(`${ADMIN_BASE}/journal-editor`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="ghost" className="gap-1">
          <Link href={`${ADMIN_BASE}/journal-editor`}>
            <ArrowLeft className="size-3.5" /> Articles
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">{existing ? "Edit" : "New article"}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {existing?.status === "published" && (
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href={`${PUBLIC_BASE}/journal/${existing.slug}`} target="_top">
                <ArrowUpRight className="size-3.5" /> View live
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => save("draft")} className="gap-1.5">
            <Save className="size-3.5" /> Save draft
          </Button>
          <Button size="sm" onClick={() => save("published")} className="gap-1.5">
            <ArrowUpRight className="size-3.5" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-4 p-6">
            <div className="grid h-32 place-items-center rounded-md bg-gradient-to-br from-muted via-muted/60 to-background text-5xl">
              {heroEmoji}
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="h-12 border-none bg-transparent text-2xl font-semibold tracking-tight focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">/journal/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="h-7 w-72" />
              <Badge variant="outline" className="ml-auto rounded-full text-[10px]">{readMinutes} min read</Badge>
            </div>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Excerpt — appears in journal list + SEO meta."
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              placeholder="Tulis artikel di sini — paragraph dipisah baris kosong."
              className="font-mono text-sm leading-relaxed"
            />
          </CardContent>
        </Card>

        <JournalEditorSidebar
          status={status} setStatus={setStatus}
          category={category} setCategory={setCategory}
          heroEmoji={heroEmoji} setHeroEmoji={setHeroEmoji}
          tags={tags} setTags={setTags}
          featured={featured} setFeatured={setFeatured}
          hasExisting={!!existing}
          onDelete={onDelete}
          onAiOutline={onAiOutline}
        />
      </div>
    </div>
  );
}
