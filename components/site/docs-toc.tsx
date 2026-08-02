"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; title: string; level?: number };

export function DocsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "0% 0% -75% 0%" }
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <aside className="hidden w-48 shrink-0 xl:block">
      <div className="sticky top-20">
        <p className="mb-3 text-xs font-semibold text-foreground">On This Page</p>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className={cn(
                  "block transition-colors",
                  i.level === 3 && "pl-3",
                  activeId === i.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {i.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
