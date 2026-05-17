"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { PROJECTS, PORTFOLIO_CATEGORIES, type Project, type ProjectCategory } from "../constants";

function isExternalImage(src: string): boolean {
  return /^https?:\/\//.test(src);
}

type RemoteItem = {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  href: string;
  category: ProjectCategory;
  year?: string;
  order: number;
};

// Asymmetric masonry pattern — 8 spans, repeats. Breaks the uniform
// grid without making layout feel chaotic. cell width × row height.
// Keyed off index mod pattern.length.
const PATTERN: Array<{ col: number; row: number; aspect?: string }> = [
  { col: 2, row: 2, aspect: "aspect-[4/5]" }, // tall feature
  { col: 1, row: 1, aspect: "aspect-square" },
  { col: 1, row: 1, aspect: "aspect-square" },
  { col: 2, row: 1, aspect: "aspect-[16/9]" }, // wide
  { col: 1, row: 1, aspect: "aspect-[3/4]" },
  { col: 1, row: 1, aspect: "aspect-square" },
  { col: 1, row: 2, aspect: "aspect-[3/5]" }, // tall
  { col: 1, row: 1, aspect: "aspect-square" },
];

export function PortfolioGrid({
  initialCategory = "all",
  showFilters = true,
  initialItems,
}: {
  initialCategory?: ProjectCategory | "all";
  showFilters?: boolean;
  initialItems?: RemoteItem[] | null;
}) {
  const [active, setActive] = useState<ProjectCategory | "all">(initialCategory);
  const live = useQuery((api as any).slices.portfolio.listAll, {}) as
    | RemoteItem[]
    | undefined;
  const remote = live ?? initialItems ?? undefined;

  const source: Project[] =
    remote && remote.length > 0
      ? remote
          .sort((a, b) => a.order - b.order)
          .map((r, i) => ({
            id: i + 1,
            title: r.title,
            excerpt: r.excerpt,
            image: r.image,
            href: `/portfolio/work/${r._id}`,
            category: r.category,
            year: r.year,
            viewTransitionName: `work-${r._id}`,
          }))
      : PROJECTS;

  const filtered = active === "all" ? source : source.filter((p) => p.category === active);

  // Scroll-reveal — tiles fade + lift in when within viewport. Stagger
  // by DOM order via CSS variable.
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!containerRef.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      containerRef.current.querySelectorAll<HTMLElement>("[data-tile]")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    containerRef.current.querySelectorAll("[data-tile]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered.length]);

  return (
    <div>
      {showFilters && (
        <div className="flex flex-wrap gap-0 mb-8 border-2 border-foreground rounded-md shadow-xs overflow-hidden w-fit">
          {PORTFOLIO_CATEGORIES.map((c, i) => (
            <Button
              key={c.value}
              type="button"
              variant="ghost"
              onClick={() => setActive(c.value)}
              className={`h-auto rounded-none px-4 py-2 text-xs uppercase tracking-brutal-sm font-medium ${
                i > 0 ? "border-l-2 border-foreground" : ""
              } ${active === c.value ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"}`}
            >
              {c.label}
            </Button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-0 border-2 border-foreground rounded-lg shadow-sm overflow-hidden"
      >
        {filtered.map((p, i) => {
          const slot = PATTERN[i % PATTERN.length];
          const colSpan = slot.col === 2 ? "md:col-span-2" : "";
          const rowSpan = slot.row === 2 ? "md:row-span-2" : "";
          return (
            <Link
              key={p.id}
              href={p.href}
              prefetch
              data-tile
              style={
                {
                  "--reveal-delay": `${Math.min(i, 10) * 60}ms`,
                  viewTransitionName: (p as any).viewTransitionName,
                } as React.CSSProperties
              }
              className={`tile-reveal group relative block border-r border-b border-foreground overflow-hidden bg-muted hover-ring ${colSpan} ${rowSpan} ${slot.aspect ?? "aspect-square"}`}
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  priority={i < 4}
                  loading={i < 4 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={isExternalImage(p.image)}
                  className="object-cover image-hover-reveal"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" aria-hidden />
              )}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/85 transition-colors flex flex-col justify-end p-4">
                <span className="text-[10px] uppercase tracking-brutal text-background/70 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.category}
                </span>
                <h3 className="mt-1 font-serif text-base lg:text-lg text-background opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.title}
                </h3>
                <p className="mt-2 text-xs text-background/70 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                  {p.excerpt}
                </p>
              </div>
              {p.year && (
                <span className="absolute top-2 right-2 bg-background text-foreground text-[10px] uppercase tracking-brutal-sm px-2 py-1 border-2 border-foreground rounded-sm z-10">
                  {p.year}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <style>{`
        .tile-reveal {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          transition: opacity 600ms cubic-bezier(0.22,1,0.36,1) var(--reveal-delay, 0ms),
                      transform 600ms cubic-bezier(0.22,1,0.36,1) var(--reveal-delay, 0ms);
        }
        .tile-reveal.is-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
        @media (prefers-reduced-motion: reduce) {
          .tile-reveal { transition: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
