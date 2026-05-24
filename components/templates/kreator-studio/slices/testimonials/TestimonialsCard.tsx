"use client";

import { Quote, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate } from "../../shared/store";
import type { Testimonial } from "../../shared/types";

/** Compact grid card — used in the masonry below the featured strip. */
export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-1">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-base">
              {t.avatar}
            </span>
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium">{t.author}</p>
              <p className="truncate text-muted-foreground">
                {t.role}
                {t.company ? ` · ${t.company}` : ""}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {fmtDate(t.receivedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/** Large gradient spotlight card — top of page, featured quotes only. */
export function FeaturedTestimonialCard({ t }: { t: Testimonial }) {
  return (
    <Card className={`relative overflow-hidden border-border/60 bg-gradient-to-br ${t.gradient}`}>
      <CardContent className="space-y-4 p-7">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-300" />
          <Badge variant="secondary" className="rounded-full text-[10px]">
            Featured
          </Badge>
        </div>
        <Quote className="size-6 text-foreground/40" />
        <p className="text-base leading-relaxed">{t.quote}</p>
        <div className="flex items-center gap-3 pt-2">
          <span className="grid size-10 place-items-center rounded-full bg-background/60 text-xl">
            {t.avatar}
          </span>
          <div className="text-sm">
            <p className="font-medium">{t.author}</p>
            <p className="text-xs text-muted-foreground">
              {t.role}
              {t.company ? ` · ${t.company}` : ""}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
