"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { PostList, type BlogPostListItem } from "../components/PostList"

const NOW = Date.now()

const MOCK_POSTS: BlogPostListItem[] = [
  {
    id: "p_1",
    title: "Promo Akhir Pekan: Diskon 20% untuk Member",
    excerpt: "Berlaku Jumat hingga Minggu untuk semua produk minuman.",
    status: "published",
    category: "promo",
    tags: ["weekend", "diskon"],
    publishedAt: NOW - 86_400_000,
    locale: "id",
  },
  {
    id: "p_2",
    title: "Tips Mengelola Stok untuk Warung Kopi",
    excerpt: "5 trik sederhana agar stok kopi tidak overstock atau habis.",
    status: "draft",
    category: "tips",
    tags: ["inventory", "kopi"],
    publishedAt: null,
    locale: "id",
  },
  {
    id: "p_3",
    title: "Pengumuman Libur Lebaran 2026",
    excerpt: "Jadwal operasi selama liburan dan layanan online tetap aktif.",
    status: "scheduled",
    category: "pengumuman",
    tags: ["lebaran", "libur"],
    publishedAt: NOW + 7 * 86_400_000,
    locale: "id",
  },
]

function BlogPreview(_props: FeaturePreviewProps) {
  const published = MOCK_POSTS.filter((p) => p.status === "published").length
  const drafts = MOCK_POSTS.filter((p) => p.status === "draft").length
  const scheduled = MOCK_POSTS.filter((p) => p.status === "scheduled").length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Artikel Terbaru</h2>
        <p className="text-sm text-muted-foreground">
          {published} terbit · {drafts} draft · {scheduled} terjadwal
        </p>
      </div>
      <PostList posts={MOCK_POSTS} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "blog",
  name: "Blog",
  description: "Tulis dan terbitkan artikel untuk pelanggan.",
  component: BlogPreview,
  category: "content",
  mockDataSets: [
    {
      id: "blog-default",
      name: "Default sample posts",
      description: "Three posts demonstrating published / draft / scheduled states.",
      data: { posts: MOCK_POSTS },
    },
  ],
})
