export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  author: string;
  date: string;
  read: string;
  hue: number;
};

export const POSTS: Post[] = [
  { slug: "ship-the-slice-mesh", title: "Ship the slice mesh in one afternoon", excerpt: "From `npm init` to live Convex backend on Dokploy — every step worth automating.", tag: "Guide", author: "Rahman", date: "2026-05-12", read: "6 min", hue: 270 },
  { slug: "bidir-sync-explained", title: "Bidir sync, explained without buzzwords", excerpt: "How `.kitab.json` keeps consumer copies and the kitab honest.", tag: "Deep dive", author: "Rahman", date: "2026-05-08", read: "9 min", hue: 200 },
  { slug: "convex-self-host", title: "Self-hosting Convex on a $6 VPS", excerpt: "Docker-compose, env files, and HTTPS via Caddy — the lazy stack.", tag: "Ops", author: "Casa", date: "2026-04-29", read: "12 min", hue: 150 },
  { slug: "audit-bp-score-80", title: "Why we gate ships at audit-bp ≥ 80", excerpt: "Numeric quality gates beat opinion, and stay objective.", tag: "Process", author: "Rahman", date: "2026-04-21", read: "4 min", hue: 30 },
  { slug: "next-16-cache-components", title: "Next 16 Cache Components in production", excerpt: "Partial prerendering, dynamic streaming, and where it really shines.", tag: "Engineering", author: "Casa", date: "2026-04-14", read: "8 min", hue: 330 },
  { slug: "rbac-six-roles", title: "Six roles that cover most apps", excerpt: "The role matrix from the platform-admin slice — copy what works.", tag: "Patterns", author: "Rahman", date: "2026-04-02", read: "5 min", hue: 100 },
];

export function Thumb({ post, className = "" }: { post: Post; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${post.hue} 70% 55% / 0.4), hsl(${(post.hue + 60) % 360} 70% 55% / 0.2))`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]" />
      <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium backdrop-blur">
        {post.tag}
      </span>
    </div>
  );
}
