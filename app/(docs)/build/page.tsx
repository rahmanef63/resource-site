import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { CONFIGURABLE_SLUGS } from "@/lib/templates/configs";
import { BundleBuilder } from "@/components/site/bundle-builder";

export const metadata = { title: "Bundle Builder" };

export default function BuildPage() {
  const items = [
    ...layouts
      .filter((l) => CONFIGURABLE_SLUGS.includes(l.slug))
      .map((l) => ({ slug: l.slug, title: l.title, description: l.description, kind: "layout" as const })),
    ...recipes
      .filter((r) => CONFIGURABLE_SLUGS.includes(r.slug))
      .map((r) => ({ slug: r.slug, title: r.title, description: r.description, kind: "recipe" as const })),
  ];

  return <BundleBuilder items={items} />;
}
