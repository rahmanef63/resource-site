"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "../../shared/store";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";

export function PortfolioListPage() {
  const projects = useProjects().filter((p) => p.status !== "archived");
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead eyebrow="Selected work" title="Recent client engagements" />
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`${PUBLIC_BASE}/portfolio/${p.slug}`}
            className="group block overflow-hidden rounded-lg border border-border/60 bg-card transition hover:shadow-lg"
          >
            <div className="aspect-[16/10] w-full bg-cover bg-center" style={{ backgroundImage: `url(${p.cover})` }} />
            <div className="p-5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{p.category}</span>
                <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
              </div>
              <h3 className="mt-2 text-lg font-medium group-hover:underline">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.client}</p>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
