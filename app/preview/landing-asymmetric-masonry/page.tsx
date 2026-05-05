"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const ITEMS = [
  { title: "Studio Cesca", category: "Interior",   cover: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=70" },
  { title: "Mahkota Bumi", category: "Hospitality", cover: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=70" },
  { title: "Kanvas Kayu",  category: "Furniture",   cover: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=70" },
  { title: "Lentera Tanah", category: "Atelier",    cover: "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=1200&q=70" },
  { title: "Beranda Senja", category: "Outdoor",    cover: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=70" },
  { title: "Ruang Putih",   category: "Gallery",    cover: "https://images.unsplash.com/photo-1604147495798-57beb5d6af73?auto=format&fit=crop&w=1200&q=70" },
  { title: "Atap Hijau",    category: "Garden",     cover: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=70" },
  { title: "Selasar Pagi",  category: "Daylight",   cover: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=70" },
];

const SHAPES = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
];

export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }

function Inner() {
  const p = useSearchParams();
  const cols = Number(p.get("cols") ?? 4);
  const rowHeight = Number(p.get("rowHeight") ?? 140);
  const hoverZoom = p.get("hoverZoom") !== "0";
  const captionOnHover = p.get("captionOnHover") !== "0";
  const colsClass = cols === 3 ? "md:grid-cols-3" : cols === 5 ? "md:grid-cols-5" : "md:grid-cols-4";

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Selected work</p>
        <h1 className="mt-2 font-serif text-4xl font-light tracking-tight md:text-5xl">
          Eight slots. Repeating rhythm.
        </h1>

        <div className={`mt-8 grid grid-cols-3 gap-3 ${colsClass}`} style={{ gridAutoRows: `${rowHeight}px` }}>
          {ITEMS.map((it, i) => (
            <a key={it.title} href="#" className={`group relative overflow-hidden rounded-lg ${SHAPES[i % SHAPES.length]}`}>
              <Image
                src={it.cover}
                alt={it.title}
                fill
                className={`object-cover transition-transform duration-700 ${hoverZoom ? "group-hover:scale-105" : ""}`}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {captionOnHover && (
                <div className="absolute bottom-2 left-3 translate-y-2 text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[10px] uppercase tracking-wider">{it.category}</p>
                  <p className="text-sm font-medium">{it.title}</p>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
