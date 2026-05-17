import Link from "next/link";
import { ArrowLeft, Layers, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShowcaseCard } from "@/components/site/catalog/showcase-card";
import type { SliceEntry } from "@/lib/content/slices";

const KIND_CLASS = {
  ui: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  backend: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  full: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
} as const;

export function SliceTitle({ slice }: { slice: SliceEntry }) {
  return (
    <div>
      <Link
        href="/slices"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> All slices
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Layers className="size-5 text-muted-foreground" />
        <h1 className="text-3xl font-bold tracking-tight">{slice.title}</h1>
        <Badge variant="secondary" className="text-[10px]">v{slice.version}</Badge>
        <Badge variant="outline" className="text-[10px] capitalize">{slice.category}</Badge>
        {slice.kind && (
          <Badge
            className={
              "text-[10px] uppercase " +
              (KIND_CLASS[slice.kind as keyof typeof KIND_CLASS] ?? KIND_CLASS.full)
            }
          >
            {slice.kind}
          </Badge>
        )}
      </div>
      <p className="mt-3 max-w-2xl text-muted-foreground">{slice.description}</p>
    </div>
  );
}

export function InstallCard({ slug }: { slug: string }) {
  return (
    <ShowcaseCard icon={Terminal} label="Install" variant="static">
      <pre className="overflow-x-auto rounded-md bg-muted px-4 py-3 text-sm">
        <code>{`npx rahman-resources add ${slug}`}</code>
      </pre>
      <p className="mt-3 text-xs text-muted-foreground">
        Or pull just the source:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          npx rahman-resources lift rahman:{slug}
        </code>
      </p>
    </ShowcaseCard>
  );
}
