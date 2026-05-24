"use client";

import * as React from "react";
import { Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useReviews, useStores } from "../../shared/store";
import type { Review } from "../../shared/types";

/**
 * Public testimoni wall. Headline rata-rata rating + filter chips
 * (kategori) + filter outlet. Data dari `state.reviews`; admin CRUD
 * dapat diwire ke `review.upsert` / `review.delete` actions.
 */
export function TestimoniPage() {
  const reviews = useReviews();
  const stores = useStores();
  const [cat, setCat] = React.useState<string>("Semua");
  const [storeId, setStoreId] = React.useState<string>("Semua outlet");

  const categories = React.useMemo(() => {
    const set = new Set<string>(["Semua"]);
    reviews.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [reviews]);

  const storeOptions = React.useMemo(() => {
    return [
      { id: "Semua outlet", label: "Semua outlet" },
      ...stores.map((s) => ({ id: s.id, label: s.name })),
    ];
  }, [stores]);

  const filtered = React.useMemo(() => {
    let list = reviews;
    if (cat !== "Semua") list = list.filter((r) => r.category === cat);
    if (storeId !== "Semua outlet") list = list.filter((r) => r.storeId === storeId);
    return [...list].sort((a, b) => b.publishedAt - a.publishedAt);
  }, [reviews, cat, storeId]);

  const avg = React.useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Testimoni"
        title="Apa kata pelanggan kami"
        subtitle="Kumpulan ulasan jujur dari pelanggan multi-unit usaha kami — kuliner, retail, jasa."
      />

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Rata-rata rating</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-semibold tracking-tight">{avg.toFixed(1)}</p>
              <Stars value={Math.round(avg)} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Dari {reviews.length} ulasan</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Ulasan 5 bintang</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {reviews.filter((r) => r.rating === 5).length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Pelanggan sangat puas</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Outlet aktif</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{stores.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Tersebar di {new Set(stores.map((s) => s.city)).size} kota</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <Button
            key={c}
            variant={cat === c ? "secondary" : "outline"}
            size="sm"
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
            onClick={() => setCat(c)}
          >
            {c}
          </Button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {storeOptions.map((s) => (
          <Button
            key={s.id}
            variant={storeId === s.id ? "secondary" : "outline"}
            size="sm"
            className="h-7 rounded-full px-3 text-[11px] uppercase tracking-wider"
            onClick={() => setStoreId(s.id)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-10 border-dashed bg-muted/10 p-10 text-center text-sm text-muted-foreground">
          Belum ada ulasan di filter ini.
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <ReviewCard key={r.id} review={r} storeName={stores.find((s) => s.id === r.storeId)?.name} />
          ))}
        </div>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review, storeName }: { review: Review; storeName?: string }) {
  return (
    <Card className="h-full border-border/60 bg-card/50">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-muted text-xl" aria-hidden>
              {review.emoji}
            </span>
            <div>
              <p className="text-sm font-medium leading-tight">{review.author}</p>
              <p className="text-xs text-muted-foreground">{review.city}</p>
            </div>
          </div>
          <Stars value={review.rating} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {review.category}
          </Badge>
          {storeName && <Badge className="text-[10px]">{storeName}</Badge>}
        </div>
        <div className="relative">
          <Quote className="absolute -left-1 -top-1 size-3 text-muted-foreground/40" />
          <p className="pl-3 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{fmtDate(review.publishedAt)}</p>
      </CardContent>
    </Card>
  );
}
