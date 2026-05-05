import { stack } from "@/lib/content/sections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = { title: "Stack" };

const detail: Record<string, string> = {
  "Next.js 16": "App Router + Cache Components. proxy.ts boundary. cacheComponents flag enabled.",
  "React 19": "use(promise), ref-as-prop, taint APIs, Suspense streaming.",
  "TypeScript 5.6": "Strict mode. v.id() over v.string() for IDs. as const on literal arrays.",
  "Tailwind CSS 4": "OKLch theme system. CSS-first config via @theme inline. Runtime preset switching.",
  "shadcn/ui": "All components compose from shadcn primitives. ResponsiveDialog, DateField, FileUpload primitives.",
  "Convex (self-hosted)": "Postgres-backed in prod. S3 buckets for storage. Self-hosted via docker-compose alongside Next.",
  "@convex-dev/auth": "Password + GitHub + Google providers. ConvexAuthNextjsProvider. getAuthUserId() server-side.",
  Dokploy: "Self-hosted PaaS. si-coder skill automates deploy. Hostinger DNS auto-wired if token present.",
  "Radix UI": "Headless primitives under shadcn. Accessibility first.",
  "Lucide Icons": "+ @tabler/icons-react for variety. tree-shaken via optimizePackageImports.",
};

export default function StackPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold tracking-tight">Stack</h1>
      <p className="mt-3 text-muted-foreground">
        Everything you'd pick if you were starting today.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {stack.map((s) => (
          <Card key={s.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {s.name}
                <Link
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{detail[s.name] ?? "—"}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
