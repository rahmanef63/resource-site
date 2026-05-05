import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sources } from "@/lib/content/sources";

export const metadata = { title: "Directory" };

export default function DirectoryPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Directory</h1>
        <p className="mt-3 text-muted-foreground">
          Source projects every layout and recipe is copied from. Each is a real shipped
          app. Audit the originals before adopting.
        </p>
      </div>

      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertDescription className="text-sm text-foreground/80">
          Copy-first flow only. Never greenfield — copy from a source, adjust imports,
          strip business-specific bits.
        </AlertDescription>
      </Alert>

      <div className="divide-y divide-border rounded-lg border bg-card">
        {sources.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-4 py-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
              <Box className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                {s.badge && (
                  <Badge variant="secondary" className="h-5 rounded-full text-[10px]">
                    {s.badge}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.contributes.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full text-[10px]">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            {s.url ? (
              <Button asChild variant="outline" size="sm" className="shrink-0 gap-1">
                <Link href={s.url} target="_blank" rel="noopener noreferrer">
                  View <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            ) : (
              <Badge variant="outline" className="shrink-0 rounded-md font-mono text-[10px]">
                private
              </Badge>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Don't see a source? File an issue on the kitab repo.
      </p>
    </div>
  );
}
