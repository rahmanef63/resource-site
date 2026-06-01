/** Server-side Unsplash search proxy for the `cover` slice. Holds the secret
 *  UNSPLASH_ACCESS_KEY server-side (never shipped to the client) and returns
 *  the slice's UnsplashPhoto shape. Wire the picker with
 *  `unsplashSearchVia("/api/unsplash")`. Without the key it returns an empty
 *  result + error, and the cover picker falls back to its curated set. */

import type { NextRequest } from "next/server";

// (Node.js is the default runtime; an explicit `runtime` export is incompatible
// with next.config cacheComponents and broke the build, so it's omitted.)

interface RawPhoto {
  id: string;
  urls: { regular: string; thumb: string; full: string };
  alt_description: string | null;
  width: number;
  height: number;
  links: { html: string };
  user: { name: string; links: { html: string } };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") ?? "").trim();
  const perPage = Math.max(1, Math.min(30, Number(searchParams.get("per_page")) || 24));
  if (!query) return Response.json({ photos: [], total: 0 });

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return Response.json({ photos: [], total: 0, error: "Unsplash not configured (UNSPLASH_ACCESS_KEY missing)" });
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("orientation", "landscape");

  let res: Response;
  try {
    res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
  } catch (e) {
    return Response.json({ photos: [], total: 0, error: `Network error: ${(e as Error).message}` });
  }
  if (!res.ok) {
    return Response.json({ photos: [], total: 0, error: `Unsplash ${res.status}` });
  }

  const json = (await res.json()) as { results: RawPhoto[]; total: number };
  const photos = (json.results ?? []).map((p) => ({
    id: p.id,
    regular: p.urls.regular,
    thumb: p.urls.thumb,
    full: p.urls.full,
    width: p.width,
    height: p.height,
    alt: p.alt_description ?? query,
    photographer: p.user.name,
    photographerUrl: p.user.links.html,
    source: p.links.html,
  }));
  return Response.json({ photos, total: json.total ?? photos.length });
}
