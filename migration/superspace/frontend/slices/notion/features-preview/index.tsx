"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function NotionPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">Rencana Peluncuran Produk</div>
      <p className="text-sm text-muted-foreground">
        Halaman blok — ketik &quot;/&quot; untuk menyisipkan heading, list, toggle, kode, atau kolom.
      </p>
      <div className="space-y-2">
        <div className="text-lg font-semibold">Tujuan</div>
        <p className="text-sm">Luncurkan menu baru sebelum akhir bulan.</p>
        <ul className="list-disc pl-5 text-sm">
          <li>Riset harga pesaing</li>
          <li>Foto produk</li>
          <li>Posting promo di blog</li>
        </ul>
        <div className="rounded-md border-l-4 border-primary bg-muted/50 p-3 text-sm">
          💡 Drag blok untuk mengatur ulang, atau seret ke samping untuk membuat kolom.
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "notion",
  name: "Notion",
  description: "Editor blok ala Notion — halaman kaya dengan slash menu, drag, dan markdown.",
  component: NotionPreview,
  category: "content",
  mockDataSets: [
    {
      id: "notion-default",
      name: "Sample page",
      description: "A sample block page showing headings, a list, and a callout.",
      data: {},
    },
  ],
})
