"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Phone, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCatalog } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/** Detail page for a single catalog item, looked up by slug. */
export function CatalogDetailPage({ slug }: { slug: string }) {
  const items = useCatalog();
  const item = items.find((i) => i.slug === slug);
  if (!item) notFound();

  const related = items
    .filter((i) => i.category === item.category && i.id !== item.id)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-5xl px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href={`${PUBLIC_BASE}/catalog`}>
          <ArrowLeft className="size-4" /> Kembali ke katalog
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div
          className={`flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient}`}
        >
          <span className="text-9xl drop-shadow-lg" aria-hidden>
            {item.emoji}
          </span>
        </div>

        <div className="flex flex-col justify-center space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.category}</Badge>
            {item.badge && <Badge>{item.badge}</Badge>}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {item.name}
          </h1>
          <p className="text-2xl font-semibold tabular-nums">
            {item.priceLabel}
          </p>
          <p className="text-muted-foreground">{item.blurb}</p>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`${PUBLIC_BASE}/contact`}>
                <ShoppingBag className="size-4" /> Pesan sekarang
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="tel:+6281234567890">
                <Phone className="size-4" /> Telepon kami
              </a>
            </Button>
          </div>

          <Card className="border-border/60 bg-card/50">
            <CardContent className="space-y-1 p-4 text-sm">
              <p className="font-medium">Cara order</p>
              <p className="text-muted-foreground">
                Hubungi via WhatsApp atau datang langsung ke outlet terdekat.
                Tim kami siap melayani setiap hari.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Item lain di kategori {item.category}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={`${PUBLIC_BASE}/catalog`}>
                Lihat semua <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`${PUBLIC_BASE}/catalog/${r.slug}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden border-border/60 bg-card/50 transition hover:border-foreground/30">
                  <div
                    className={`flex aspect-[5/3] items-center justify-center bg-gradient-to-br ${r.gradient}`}
                  >
                    <span className="text-4xl" aria-hidden>
                      {r.emoji}
                    </span>
                  </div>
                  <CardContent className="space-y-1 p-4">
                    <p className="font-medium group-hover:underline">{r.name}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {r.priceLabel}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
