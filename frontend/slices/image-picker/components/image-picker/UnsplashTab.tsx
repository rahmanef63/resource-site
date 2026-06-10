"use client";

/** Unsplash tab — debounced live search via the INJECTED `searchUnsplash` fn
 *  (wire it with unsplashSearchVia('/api/unsplash'); the key stays server-side).
 *  Shows the bundled curated set until a query is typed; picking delivers the
 *  full-size URL as an ImageValue, same contract as the Link/Upload tabs. */

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURATED_UNSPLASH } from "../../lib/unsplashCurated";
import type { ImageValue, UnsplashPhoto, UnsplashSearchFn } from "../../types";

export function UnsplashTab({
  onSelect, searchUnsplash, defaultQuery,
}: { onSelect: (c: ImageValue) => void; searchUnsplash?: UnsplashSearchFn; defaultQuery?: string }) {
  const [q, setQ] = React.useState(defaultQuery ?? "");
  const [results, setResults] = React.useState<UnsplashPhoto[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Debounced search through the injected seam; a stale flag drops out-of-order
  // responses (UnsplashSearchFn carries no abort signal).
  React.useEffect(() => {
    const query = q.trim();
    if (!searchUnsplash) return;
    let stale = false;
    const id = window.setTimeout(async () => {
      if (!query) { setResults(null); setErr(null); setBusy(false); return; }
      setBusy(true);
      setErr(null);
      const res = await searchUnsplash(query, 24);
      if (stale) return;
      setBusy(false);
      if (res.error) { setErr(res.error); setResults(null); return; }
      setResults(res.photos);
    }, query ? 400 : 0);
    return () => { stale = true; window.clearTimeout(id); };
  }, [q, searchUnsplash]);

  const photos = results ?? CURATED_UNSPLASH;
  const pick = (p: UnsplashPhoto) =>
    onSelect({
      type: "unsplash", value: p.regular, positionY: 50,
      metadata: { id: p.id, thumb: p.thumb, full: p.full, photographer: p.photographer, photographerUrl: p.photographerUrl, source: p.source },
    });

  return (
    <div className="@container space-y-3 p-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="px-8" aria-label="Search Unsplash"
          placeholder={searchUnsplash ? "Search Unsplash…" : "Curated picks (wire searchUnsplash for live search)"}
          value={q} disabled={!searchUnsplash}
          onChange={(e) => setQ(e.target.value)}
        />
        {busy && (
          <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
      {!results && !err && (
        <p className="text-[11px] text-muted-foreground">
          Curated landscapes{searchUnsplash ? " — type above for live search" : ""}.
        </p>
      )}
      {results?.length === 0 && !busy && (
        <p className="text-xs text-muted-foreground">No results for &ldquo;{q.trim()}&rdquo;.</p>
      )}
      <div className="grid grid-cols-2 gap-2 @md:grid-cols-3 @2xl:grid-cols-4">
        {photos.map((p) => (
          <Button
            key={p.id} type="button" variant="ghost" onClick={() => pick(p)}
            className="group relative h-20 w-full overflow-hidden rounded-md p-0 ring-1 ring-border transition hover:ring-2 hover:ring-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt={p.alt || "Stock photo"} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-left text-[9px] text-white">
              {p.photographer || "Unknown"}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
