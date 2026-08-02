"use client";

import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

type Service = {
  title: string;
  summary: string;
  deliverables: string[];
  order: number;
};

const SERVICES: Service[] = [
  { order: 1, title: "Brand & Identity", summary: "Logo system, type scale, color tokens, usage guide.", deliverables: ["Logo suite", "Brand book", "Token sheet"] },
  { order: 2, title: "Web Design & Build", summary: "Marketing site or app shell, responsive, SEO-ready.", deliverables: ["UX wireframes", "Next.js build", "CMS wiring"] },
  { order: 3, title: "Product Strategy", summary: "Roadmap, scope, and stack decisions before a line of code.", deliverables: ["Discovery doc", "Roadmap", "Tech spec"] },
];

/** services preview — a backend slice (public read + admin CRUD + seed). This
 *  demo shows BOTH consumer surfaces so the function is obvious: the public
 *  cards a visitor sees, and the admin table an operator edits. */
export default function Page() {
  return (
    <SlicePreviewLayout
      title="Services"
      kind="full"
      description="Service offerings backend — title + summary + deliverables[] + order. Public read, admin CRUD, internal seed. Below: the public grid (left) and the admin table that feeds it (right)."
      maxWidth="6xl"
    >
      <PreviewSection title="Public — services grid" hint="useQuery(listAll), ordered by `order`">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.order} className="flex flex-col rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.deliverables.map((d) => (
                  <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Admin — CRUD table" hint="requireAdmin gate · create / reorder / edit / remove">
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {SERVICES.length} services
            </span>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
              <Plus className="size-3.5" /> New service
            </Button>
          </div>
          <ul className="divide-y">
            {SERVICES.map((s) => (
              <li key={s.order} className="flex items-center gap-2 px-3 py-2.5">
                <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50" />
                <span className="w-6 shrink-0 text-center text-[11px] tabular-nums text-muted-foreground">{s.order}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.summary}</p>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={`Edit ${s.title}`}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete ${s.title}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
