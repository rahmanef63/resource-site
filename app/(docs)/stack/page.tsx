import Link from "next/link";
import { ArrowUpRight, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DocCard } from "@/components/site/doc-primitives";
import { PageHeader } from "@/components/site/page-header";
import { stack } from "@/lib/content/sections";

export const metadata = { title: "Stack" };

const GROUPS = ["Frameworks", "Shared foundation", "UI libraries", "Package managers", "Delivery"] as const;

export default function StackPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Get Started"
        title="Stack"
        description="Two renderers, one portable slice contract, and npm/Bun as equal install paths."
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Canonical slices" value="66 / 66" note="Next + Svelte" />
        <Metric label="Default" value="Next.js + React" note="full-app templates" />
        <Metric label="Alternate" value="SvelteKit + Svelte 5" note="native slice renderer" />
        <Metric label="Package managers" value="npm + Bun" note="npx / bunx" />
      </div>

      <div className="space-y-7">
        {GROUPS.map((group) => {
          const entries = stack.filter((item) => item.group === group);
          return (
            <section key={group} className="space-y-2">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{group}</h2>
                <Badge variant="secondary">{entries.length}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {entries.map((item) => (
                  <DocCard key={item.name} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                      <Link href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} docs`} className="shrink-0 text-muted-foreground hover:text-foreground">
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                  </DocCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <DocCard className="px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>
    </DocCard>
  );
}
