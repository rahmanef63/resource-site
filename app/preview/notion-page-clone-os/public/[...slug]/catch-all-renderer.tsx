"use client";

import { notFound } from "next/navigation";
import { BlocksRenderer } from "@/components/templates/_shared/pages/block-renderer";
import { usePages } from "@/components/templates/notion-page-clone/shared/store";

/** Catch-all renderer: reads localStorage-hydrated pages slice + renders
 *  matching slug. System pages own their JSX routes; this only handles
 *  custom pages. Unknown slug → 404. */
export function CatchAllRenderer({ slug }: { slug: string }) {
  const pages = usePages();
  const page = pages.find(
    (p) => !p.systemPage && p.slug === slug && p.status === "published",
  );
  if (!page) notFound();
  return (
    <article>
      <BlocksRenderer blocks={page.blocks} />
    </article>
  );
}
