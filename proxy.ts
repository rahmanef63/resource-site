// Next.js 16 request-time proxy boundary — host-based demo
// subdomain rewriter (BR-wave, 2026-05-20).
//
// What it does:
//   demo-konsultan.rahmanef.com/         → /preview/konsultan-os/public
//   demo-konsultan.rahmanef.com/contact  → /preview/konsultan-os/public/contact
//   demo-konsultan.rahmanef.com/admin    → /preview/konsultan-os/dashboard/admin
//   demo-konsultan.rahmanef.com/admin/X  → /preview/konsultan-os/dashboard/admin/X
//
// What it does NOT do:
//   - Touch rahmanef.com (Rahman's personal site — different deployment)
//   - Touch resource.rahmanef.com (rr main canonical site)
//   - Rewrite /_next/* (Next.js assets)
//   - Rewrite /api/* (route handlers stay accessible per subdomain)
//   - Rewrite /favicon.ico, /robots.txt, /sitemap.xml, /llms.txt
//
// Single source of truth for the subdomain map: lib/content/template-subdomains.ts.

import { NextRequest, NextResponse } from "next/server";
import { resolveDemoSlug } from "@/lib/content/template-subdomains";

// Paths the proxy must NEVER rewrite — Next.js internals + APIs +
// well-known root files (sitemap/robots/og/etc).
const PASSTHROUGH_PREFIXES = [
  "/_next",
  "/api",
  "/brand-assets",
  "/static",
];
const PASSTHROUGH_EXACT = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
]);

export default function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const slug = resolveDemoSlug(host);

  // Not a demo subdomain — pass through.
  if (!slug) return NextResponse.next();

  const pathname = request.nextUrl.pathname;

  // Never rewrite Next assets, API routes, or root meta files.
  if (PASSTHROUGH_EXACT.has(pathname)) return NextResponse.next();
  for (const prefix of PASSTHROUGH_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // Map subdomain paths onto the right /preview/<slug>/* sub-tree.
  //   /admin/* → /preview/<slug>/dashboard/admin/*
  //   /*       → /preview/<slug>/public/*  (default: public site)
  let target: string;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    target = `/preview/${slug}/dashboard/admin${pathname.slice("/admin".length)}`;
  } else {
    target = `/preview/${slug}/public${pathname === "/" ? "" : pathname}`;
  }

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

// Run on every request. The proxy itself returns NextResponse.next()
// early when host is not a demo subdomain — fast pass-through cost.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
