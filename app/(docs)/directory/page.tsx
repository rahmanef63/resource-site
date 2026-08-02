import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { DocCard } from "@/components/site/doc-primitives";
import { sources } from "@/lib/content/sources";

export const metadata = { title: "Directory" };

// Apps built from this library — related projects, not slice sources (those live in sources.ts).
const relatedProjects = [
  { name: "Rahman OS", url: "https://shell.rahmanef.com", tag: "shell.rahmanef.com", description: "Manifest-driven desktop/mobile web-OS shell — windows, dock, widgets, app store." },
  { name: "Topside", url: "https://os.rahmanef.com", tag: "os.rahmanef.com", description: "Mobile-first web cockpit for a headless Linux VPS." },
  { name: "belajar-with-rahmanef", url: "https://study-with.rahmanef.com", tag: "study-with.rahmanef.com", description: "Learn AI through a browser web-OS desktop. Charity project." },
];

export default function DirectoryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalog"
        title="Directory"
        description="Source projects every layout and recipe is copied from. Each is a real shipped app. Audit the originals before adopting."
      />

      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertDescription className="text-sm text-foreground/80">
          Copy-first flow only. Never greenfield — copy from a source, adjust imports,
          strip business-specific bits.
        </AlertDescription>
      </Alert>

      <DocCard className="divide-y divide-border">
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
      </DocCard>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Related projects</p>
          <p className="text-sm text-muted-foreground">
            Apps built from this library — the slices in action.
          </p>
        </div>
        <DocCard className="divide-y divide-border">
          {relatedProjects.map((p) => (
            <div key={p.url} className="flex items-center gap-4 px-4 py-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Box className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <Badge variant="outline" className="rounded-full font-mono text-[10px]">
                    {p.tag}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0 gap-1">
                <Link href={p.url} target="_blank" rel="noopener noreferrer">
                  View <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
          ))}
        </DocCard>
      </div>

      <p className="text-xs text-muted-foreground">
        Don't see a source? File an issue on the resources repo.
      </p>
    </div>
  );
}
