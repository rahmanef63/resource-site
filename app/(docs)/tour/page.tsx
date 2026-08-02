import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { acts } from "@/lib/content/tour";
import { CatalogHero } from "@/components/site/catalog/catalog-hero";
import { DocCard } from "@/components/site/doc-primitives";
import { Badge } from "@/components/ui/badge";
import { UseWideLayout } from "@/components/site/use-wide-layout";

export const metadata = {
  title: "Grand Tour — the whole catalog, act by act",
  description:
    "A guided walk through every slice in the catalog, grouped into six acts from marketing chrome to platform backbone.",
};

export default function TourPage() {
  return (
    <div className="space-y-8">
      <UseWideLayout />
      <CatalogHero
        pill="Guided"
        icon={Compass}
        title="Grand Tour"
        subtitle={
          <>
            One pass through the entire catalog, told as six acts. Each act
            mounts its slices live where it can, and shows a capability card
            where a slice needs a key. Start at Act I or jump straight to the
            backbone.
          </>
        }
        primaryCta={{ label: "Browse all slices", href: "/slices" }}
        secondaryCta={{ label: "Bundle builder", href: "/build" }}
        commands={["npx rahman-resources add <slug>"]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {acts.map((act) => (
          <DocCard
            key={act.id}
            className="flex flex-col gap-3 transition hover:border-foreground/30"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight">
                {act.title}
              </h2>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {act.sliceSlugs.length} slice
                {act.sliceSlugs.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="flex-1 text-sm text-muted-foreground">{act.blurb}</p>
            <Link
              href={`/tour/${act.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition hover:gap-1.5"
            >
              Enter act <ArrowRight className="size-3.5" />
            </Link>
          </DocCard>
        ))}
      </div>
    </div>
  );
}
