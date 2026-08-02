import type { BlogPost } from "../blog-card";

/** Shared fixture for blog preview variants. Centralizing here so all
 *  five blog views render against the same dataset (DRY). */
export const SAMPLE_POSTS: BlogPost[] = [
  { slug: "ship-the-slice-mesh", title: "Ship the slice mesh in one afternoon", excerpt: "From `npm init` to live Convex backend on Dokploy — every step worth automating.", tag: "Guide", author: "Rahman", date: "2026-05-12", read: "6 min", hue: 270 },
  { slug: "bidir-sync-explained", title: "Bidir sync, explained without buzzwords", excerpt: "How `.kitab.json` keeps consumer copies and the kitab honest.", tag: "Deep dive", author: "Rahman", date: "2026-05-08", read: "9 min", hue: 200 },
  { slug: "convex-self-host", title: "Self-hosting Convex on a $6 VPS", excerpt: "Docker-compose, env files, and HTTPS via Caddy — the lazy stack.", tag: "Ops", author: "Casa", date: "2026-04-29", read: "12 min", hue: 150 },
  { slug: "audit-bp-score-80", title: "Why we gate ships at audit-bp ≥ 80", excerpt: "Numeric quality gates beat opinion, and stay objective.", tag: "Process", author: "Rahman", date: "2026-04-21", read: "4 min", hue: 30 },
  { slug: "next-16-cache-components", title: "Next 16 Cache Components in production", excerpt: "Partial prerendering, dynamic streaming, and where it really shines.", tag: "Engineering", author: "Casa", date: "2026-04-14", read: "8 min", hue: 330 },
  { slug: "rbac-six-roles", title: "Six roles that cover most apps", excerpt: "The role matrix from the platform-admin slice — copy what works.", tag: "Patterns", author: "Rahman", date: "2026-04-02", read: "5 min", hue: 100 },
];
