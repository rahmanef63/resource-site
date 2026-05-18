"use client";

import { Package } from "lucide-react";
import {
  FeatureGridSection,
  type FeatureGroup,
} from "@/features/feature-grid";
import { useBusinesses, useProducts } from "../../shared/store";

/**
 * Multi-unit catalog rendered via the canonical feature-grid slice
 * (DRY+SSOT) using the `grouped` layout. Each Business becomes a labeled
 * group; products under it map to FeatureItem. Admin CRUD propagates via
 * createTemplateStore BroadcastChannel.
 */
export function ServicesPage() {
  const businesses = useBusinesses();
  const products = useProducts();

  const groups: FeatureGroup[] = businesses
    .map((b) => {
      const items = products
        .filter((p) => p.businessId === b.id)
        .map((p) => ({
          id: p.id,
          title: p.name,
          body: `${p.priceLabel} · ${p.stock} ${p.unit}\nSKU: ${p.sku}`,
          icon: Package,
        }));
      return { id: b.id, label: b.name, sublabel: `${b.type} · ${b.city}`, items };
    })
    .filter((g) => g.items.length > 0);

  return (
    <FeatureGridSection
      eyebrow="Katalog"
      title="Produk & jasa multi-unit"
      subtitle="Daftar lengkap dari semua unit usaha yang tergabung."
      groups={groups}
      layout="grouped"
      columns={3}
    />
  );
}
