"use client"

import * as React from "react"
import { Database, Users, Package } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { MetricCard } from "@/frontend/shared/ui/dashboard"
import { DataTable } from "@/frontend/shared/ui/components/data-display/table"

interface VendorRow {
  name: string
  type: string
  purchases: number
}

interface ProductRow {
  name: string
  pricingClass: string
  hpp: number
}

const MOCK_VENDORS: VendorRow[] = [
  { name: "PT CIOMAS ADISATWA", type: "Frozen Meat", purchases: 45 },
  { name: "CV SUMBER MAKMUR", type: "Cooking Oil", purchases: 18 },
  { name: "TOKO BERAS JAYA", type: "Rice & Grains", purchases: 12 },
]

const MOCK_PRODUCTS: ProductRow[] = [
  { name: "Paket Hemat 1", pricingClass: "A", hpp: 18_500 },
  { name: "Paket Hemat 2", pricingClass: "A", hpp: 22_000 },
  { name: "Crispy Wings 5pcs", pricingClass: "B", hpp: 14_200 },
]

const formatRp = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

function QsrMasterDataPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">QSR Master Data</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_VENDORS.length} vendors · {MOCK_PRODUCTS.length} products · HPP & pricing class
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-shrink-0 items-center gap-2 border-b px-4 py-3">
        <Database className="h-5 w-5 text-emerald-600" />
        <h3 className="text-base font-semibold">QSR Master Data</h3>
        <span className="ml-auto text-xs text-muted-foreground">Vendors + HPP catalog</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard title="Vendors" value={MOCK_VENDORS.length} icon={Users} />
          <MetricCard title="Products" value={MOCK_PRODUCTS.length} icon={Package} />
        </div>

        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <Users className="h-3.5 w-3.5" /> Vendors
          </h4>
          <DataTable
            data={MOCK_VENDORS}
            columns={[
              { key: "name", header: "Name" },
              { key: "type", header: "Type" },
              { key: "purchases", header: "Purchases", render: (v) => <span className="tabular-nums">{String(v)}×</span> },
            ]}
          />
        </section>

        <section>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase">
            <Package className="h-3.5 w-3.5" /> Products (HPP)
          </h4>
          <DataTable
            data={MOCK_PRODUCTS}
            columns={[
              { key: "name", header: "Name" },
              { key: "pricingClass", header: "Class", render: (v) => <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{String(v)}</span> },
              { key: "hpp", header: "HPP", render: (v) => <span className="tabular-nums">{formatRp(Number(v))}</span> },
            ]}
          />
        </section>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "qsr-master-data",
  name: "QSR Master Data",
  description: "Vendor + product HPP catalog with pricing class, ingredient mapping, recipe costing.",
  component: QsrMasterDataPreview,
  category: "administration",
  tags: ["qsr", "fnb", "master", "vendors", "hpp"],
  mockDataSets: [
    {
      id: "default",
      name: "Sample masters",
      description: "3 vendors + 3 products with HPP & pricing class.",
      data: { vendors: MOCK_VENDORS, products: MOCK_PRODUCTS },
    },
  ],
})
