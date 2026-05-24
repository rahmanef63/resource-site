"use client";

import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { useStores } from "../../shared/store";
import type { StoreLocation } from "../../shared/types";

/**
 * Public outlet directory. Lists every physical location across all units,
 * grouped by city. Each card has phone + maps + hours. Data sourced from
 * `state.stores` — admin can later edit via createTemplateStore actions.
 */
export function StoresPage() {
  const stores = useStores();

  const byCity = stores.reduce<Record<string, StoreLocation[]>>((acc, s) => {
    (acc[s.city] ??= []).push(s);
    return acc;
  }, {});

  const cities = Object.keys(byCity).sort();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        eyebrow="Outlet"
        title="Temui kami langsung"
        subtitle="Datangi outlet terdekat untuk merasakan layanan langsung, atau telepon untuk pesan antar."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Tersedia di:</span>
        {cities.map((city) => (
          <Badge key={city} variant="outline">
            {city} · {byCity[city].length}
          </Badge>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {cities.map((city) => (
          <div key={city}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <MapPin className="size-4 text-muted-foreground" />
              {city}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {byCity[city].map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoreCard({ store }: { store: StoreLocation }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/50">
      <div
        className={`flex aspect-[7/2] items-center justify-center bg-gradient-to-br ${store.gradient}`}
      >
        <span className="text-5xl drop-shadow-md" aria-hidden>
          {store.emoji}
        </span>
      </div>
      <CardContent className="space-y-3 p-5">
        <div>
          <h3 className="font-medium leading-snug">{store.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            {store.city}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground">{store.address}</p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-muted-foreground">{store.hours}</p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <a
              href={`tel:${store.phone.replace(/\s/g, "")}`}
              className="text-foreground hover:underline"
            >
              {store.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" asChild>
            <a href={`tel:${store.phone.replace(/\s/g, "")}`}>
              <Phone className="size-3.5" /> Telepon
            </a>
          </Button>
          {store.mapsUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-3.5" /> Petunjuk arah
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
