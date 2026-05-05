"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProject } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function PortfolioDetailPage({ slug }: { slug: string }) {
  const p = useProject(slug);
  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Project not found</h1>
        <Button asChild className="mt-6"><Link href={`${PUBLIC_BASE}/portfolio`}>Back to work</Link></Button>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={`${PUBLIC_BASE}/portfolio`}><ArrowLeft className="size-3.5" /> All work</Link>
      </Button>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{p.title}</h1>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
        <span>{p.client}</span>
        <span>·</span>
        <Badge variant="outline">{p.status}</Badge>
      </div>
      <div
        className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${p.cover})` }}
      />
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium">Brief</h2>
          <p className="mt-2 text-sm text-muted-foreground">{p.brief}</p>
        </section>
        <section>
          <h2 className="text-lg font-medium">Outcome</h2>
          <p className="mt-2 text-sm text-muted-foreground">{p.outcome}</p>
        </section>
      </div>
    </article>
  );
}
