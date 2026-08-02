"use client";

import { Pencil, Trash2, Plus, GripVertical, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SlicePreviewLayout,
  PreviewSection,
} from "@/components/slice-previews/preview-layout";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  order: number;
};

const ITEMS: Testimonial[] = [
  { order: 1, quote: "Shipped our marketing site in a weekend. The slice approach is unreal.", name: "Maya Tan", role: "Founder, Northwind" },
  { order: 2, quote: "We swapped three vendors for one repo. Onboarding dropped to a day.", name: "Devin Cole", role: "CTO, Parallel" },
  { order: 3, quote: "Type-safe end to end, self-hosted, zero lock-in. Exactly what we needed.", name: "Priya Nair", role: "Lead Eng, Str042" },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-primary text-[11px] font-bold text-primary-foreground">
      {initials}
    </div>
  );
}

/** testimonials preview — backend slice (public read + admin CRUD + seed).
 *  Shows both surfaces: the public quote wall and the admin table behind it. */
export default function Page() {
  return (
    <SlicePreviewLayout
      title="Testimonials"
      kind="full"
      description="Quote / name / role rotator backend. Public listAll (no auth), admin CRUD via requireAdmin, internal seed. Below: the public wall (top) and the admin table that feeds it (bottom)."
      maxWidth="6xl"
    >
      <PreviewSection title="Public — testimonial wall" hint="useQuery(listAll), ordered by `order`">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((t) => (
            <figure key={t.order} className="flex flex-col rounded-xl border bg-card p-4">
              <Quote className="size-4 text-primary/50" />
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-3 flex items-center gap-2">
                <Avatar name={t.name} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{t.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Admin — CRUD table" hint="requireAdmin gate · create / reorder / edit / remove">
        <div className="overflow-hidden rounded-xl border">
          <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {ITEMS.length} testimonials
            </span>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
              <Plus className="size-3.5" /> New quote
            </Button>
          </div>
          <ul className="divide-y">
            {ITEMS.map((t) => (
              <li key={t.order} className="flex items-center gap-2 px-3 py-2.5">
                <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50" />
                <span className="w-6 shrink-0 text-center text-[11px] tabular-nums text-muted-foreground">{t.order}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{t.quote}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.name} · {t.role}</p>
                </div>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={`Edit quote from ${t.name}`}>
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Delete quote from ${t.name}`}>
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
