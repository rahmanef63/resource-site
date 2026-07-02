import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Blog Feature Configuration
 *
 * UMKM-friendly blog/announcements module — Indonesian-first content
 * publishing with categories, tags, and draft → published lifecycle.
 *
 * Replaces cms-lite for content publishing surface.
 */
export default defineFeature({
  id: 'blog',
  name: 'Blog',
  description: 'Tulis artikel, pengumuman, dan konten untuk pelanggan dengan editor sederhana.',

  ui: {
    icon: 'Newspaper',
    path: '/dashboard/blog',
    component: 'BlogPage',
    category: 'content',
    order: 110,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Status (2026-05-18):
  // Backend (createPost / publishPost / archivePost / listPosts / listCategories)
  // + frontend list view + editor dialog wired. MVP beta — no rich text editor
  // yet (markdown textarea), no scheduled publish UI surface.
  status: {
    state: 'beta',
    isReady: true,
  },

  permissions: [
    'blog.view',
    'blog.create',
    'blog.publish',
    'blog.delete',
  ],

  bundles: {
    core: [],
    recommended: ["business-pro"],
    optional: ["custom"],
  },

  tags: ["blog", "content", "marketing"],
})
