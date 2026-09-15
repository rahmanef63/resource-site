import { Boxes, Package, Route, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/site/code-block";
import { DocCard } from "@/components/site/doc-primitives";
import {
  FRAMEWORK_PROFILES,
  PACKAGE_MANAGER_PROFILES,
  sliceInstallCommand,
} from "@/lib/content/framework-matrix";
import type { SliceFrameworkSupport } from "@/lib/content/slice-framework-support";

export function FrameworkComparison({ slug, support }: { slug: string; support: SliceFrameworkSupport[] }) {
  if (support.length === 0) return null;
  return (
    <section className="space-y-2" aria-labelledby="framework-comparison-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Framework distributions</p>
          <h2 id="framework-comparison-title" className="text-sm font-semibold">Next.js vs SvelteKit</h2>
        </div>
        <div className="flex gap-1">
          {PACKAGE_MANAGER_PROFILES.map((pm) => <Badge key={pm.id} variant="outline">{pm.label}</Badge>)}
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {support.map((item) => {
          const profile = FRAMEWORK_PROFILES.find((p) => p.id === item.id)!;
          return (
            <DocCard key={item.id} className="min-w-0 overflow-hidden p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="grid size-8 place-items-center rounded-md border bg-muted/40">
                  {item.id === "react-next" ? <Route className="size-4" /> : <Sparkles className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-semibold">{profile.label}</p>
                    {item.isDefault && <Badge>default</Badge>}
                    <Badge variant="secondary">{item.mode === "shared" ? "shared core" : "native renderer"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{profile.renderer} · {profile.runtime}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <Meta icon={<Boxes className="size-3" />} label="Source" value={item.path} />
                <Meta icon={<Package className="size-3" />} label="Runtime deps" value={item.npm.length ? `${item.npm.length} npm package(s)` : "framework-neutral"} />
              </div>
              <div className="mt-3 space-y-2">
                {PACKAGE_MANAGER_PROFILES.map((pm) => (
                  <CodeBlock key={pm.id} code={sliceInstallCommand(slug, item.id, pm.id)} language="bash" filename={`${pm.id}.sh`} />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {item.shadcn.length ? `${item.shadcn.length} shadcn primitive(s)` : "No renderer-specific shadcn dependency"}
                {item.sharedFiles.length ? ` · ${item.sharedFiles.length} portable shared file(s)` : ""}
              </p>
            </DocCard>
          );
        })}
      </div>
    </section>
  );
}

export function FrameworkSourceSummary({ support }: { support: SliceFrameworkSupport[] }) {
  return (
    <div className="grid gap-2 text-xs sm:grid-cols-2">
      {support.map((item) => (
        <div key={item.id} className="rounded-md border bg-muted/20 p-2">
          <p className="font-medium">{item.id === "react-next" ? "Next.js / React" : "SvelteKit / Svelte 5"}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground" title={item.path}>{item.path}</p>
        </div>
      ))}
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <p className="mt-1 truncate font-mono text-[11px]" title={value}>{value}</p>
    </div>
  );
}
