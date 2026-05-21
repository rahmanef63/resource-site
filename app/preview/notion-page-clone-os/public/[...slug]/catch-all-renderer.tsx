"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlocksRenderer } from "@/components/templates/_shared/pages/block-renderer";
import { usePages } from "@/components/templates/notion-page-clone/shared/store";

/** BZ-wave (2026-05-21) — public-share rendering.
 *  Custom workspace page rendered standalone (no Dashboard sidebar,
 *  no marketing chrome). Mirrors Notion's "publish to web" UX where a
 *  shared page is just the doc on a centered canvas with a thin
 *  back-to-app link. System pages own their JSX routes; this only
 *  handles custom pages created via the admin Pages CMS. Unknown
 *  slug → 404. */
export function CatchAllRenderer({ slug }: { slug: string }) {
  const pages = usePages();
  const page = pages.find(
    (p) => !p.systemPage && p.slug === slug && p.status === "published",
  );
  if (!page) notFound();
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-3 text-xs">
          <Link href="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3" /> Back to workspace
          </Link>
          <span className="text-muted-foreground/50">·</span>
          <span className="font-mono text-[10px] text-muted-foreground">public · /{slug}</span>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-10">
        <BlocksRenderer blocks={page.blocks} />
      </article>
    </div>
  );
}
