import { PackageSearch } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RegistryTable } from "@/components/admin/registry-table";
import { loadSliceRegistry } from "@/lib/admin/registry";

export const metadata = {
  title: "Admin · Slice registry",
  robots: { index: false, follow: false },
};

export default async function AdminRegistryPage() {
  const slices = await loadSliceRegistry();
  const withContract = slices.filter((s) => s.hasContract).length;
  const withManifest = slices.filter((s) => s.hasManifest).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Inspect"
        title="Slice registry"
        description="Live read of frontend/slices/*/slice.json. Contract column = contract block in slice.json present. Manifest column = slice.manifest.json present (CLI-distributable via npx rr add). Hide marks a slug for removal from public catalogs — export lib/content/hidden-slugs.ts and wire isHidden(slug) into consumers."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Slices" value={slices.length} icon={PackageSearch} />
        <StatCard
          label="With contract"
          value={withContract}
          hint="contract block in slice.json"
          tone={withContract === slices.length ? "ok" : "warn"}
        />
        <StatCard
          label="Portable (manifest)"
          value={withManifest}
          hint="CLI-distributable"
        />
        <StatCard
          label="Categories"
          value={new Set(slices.map((s) => s.category ?? "—")).size}
        />
      </section>

      <RegistryTable slices={slices} />
    </div>
  );
}
