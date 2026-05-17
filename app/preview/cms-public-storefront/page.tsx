"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRODUCTS = [
  { id: "1", name: "Wedang Uwuh",     price: 28000, img: "https://images.unsplash.com/photo-1547517023-7ca0c162f816?auto=format&fit=crop&w=800&q=70", tag: "Hot" },
  { id: "2", name: "Tepak Sirih",      price: 145000, img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=70", tag: "Limited" },
  { id: "3", name: "Lurik Klasik",     price: 320000, img: "https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=800&q=70", tag: "Bestseller" },
  { id: "4", name: "Kayu Jati Mini",   price: 95000, img: "https://images.unsplash.com/photo-1567721913486-6585f069b332?auto=format&fit=crop&w=800&q=70", tag: "" },
  { id: "5", name: "Bantal Tenun",     price: 175000, img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=70", tag: "" },
  { id: "6", name: "Sandal Anyaman",   price: 89000, img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=70", tag: "New" },
];

const CURRENCIES = [
  { code: "IDR", rate: 1, sym: "Rp" },
  { code: "USD", rate: 0.000063, sym: "$" },
  { code: "JPY", rate: 0.0096, sym: "¥" },
];

export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }

function Inner() {
  const p = useSearchParams();
  const cartUI = p.get("cart") ?? "badge";
  const currencyMode = p.get("currency") ?? "header";
  const cols = Number(p.get("cols") ?? 3);
  const showTags = p.get("tags") !== "0";
  const showSearch = p.get("search") !== "0";
  const showI18n = p.get("i18n") === "1";
  const colsClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  const [cur, setCur] = React.useState(CURRENCIES[0]);
  const [cart, setCart] = React.useState<string[]>([]);
  const [drawer, setDrawer] = React.useState(false);

  const fmt = (idr: number) => {
    const n = idr * cur.rate;
    return `${cur.sym}${n.toLocaleString(undefined, { maximumFractionDigits: cur.code === "IDR" ? 0 : 2 })}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <Globe className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Pasar Nusantara</span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#" className="hover:underline">Shop</a>
            <a href="#" className="hover:underline">Stories</a>
            <a href="#" className="hover:underline">About</a>
          </nav>
          <div className="flex items-center gap-3">
            {showSearch && (
              <Button type="button" variant="outline" className="hidden size-8 items-center justify-center rounded-md border md:flex">
                <Search className="size-3.5" />
              </Button>
            )}
            {showI18n && (
              <select className="rounded-md border bg-background px-2 py-1 text-xs">
                <option>ID</option><option>EN</option><option>JA</option>
              </select>
            )}
            {currencyMode === "header" && (
              <select
                value={cur.code}
                onChange={(e) => setCur(CURRENCIES.find((c) => c.code === e.target.value)!)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            )}
            <Button type="button" variant="outline" onClick={() => cartUI === "drawer" ? setDrawer(true) : null} className="relative flex size-8 items-center justify-center rounded-md border">
              <ShoppingBag className="size-3.5" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-amber-950">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Koleksi pilihan
        </p>
        <h1 className="mt-2 font-serif text-4xl font-light tracking-tight md:text-5xl">
          Crafted in Java. Shipped worldwide.
        </h1>

        <div className={cn("mt-8 grid grid-cols-2 gap-4", colsClass)}>
          {PRODUCTS.map((p) => (
            <article key={p.id} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border bg-muted">
                <Image src={p.img} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 50vw, 33vw" />
                {showTags && p.tag && (
                  <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="shrink-0 text-sm tabular-nums text-muted-foreground">{fmt(p.price)}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCart((c) => [...c, p.id])}
                className="mt-2 h-auto w-full rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                Tambah ke keranjang
              </Button>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t bg-muted/30 py-8 text-center text-xs text-muted-foreground">
        © 2026 Pasar Nusantara · Fulfilled by Convex CMS-lite
        {currencyMode === "footer" && (
          <span className="ml-2"> · <a className="underline" href="#">Currency: {cur.code}</a></span>
        )}
      </footer>

      {drawer && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDrawer(false)}>
          <div className="flex-1 bg-black/40" />
          <aside onClick={(e) => e.stopPropagation()} className="w-80 border-l bg-background p-4 shadow-xl">
            <p className="text-sm font-semibold">Cart ({cart.length})</p>
            <p className="mt-2 text-xs text-muted-foreground">Drawer-mode cart UI.</p>
          </aside>
        </div>
      )}
    </main>
  );
}
