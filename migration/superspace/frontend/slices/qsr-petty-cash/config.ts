import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Qsr Petty Cash Feature Configuration
 *
 * This is the single source of truth for the qsr-petty-cash feature.
 * Auto-discovered by the feature registry system.
 *
 * @see frontend/shared/lib/features/registry.ts for auto-discovery
 * @see frontend/shared/lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: 'qsr-petty-cash',
  name: 'QSR Petty Cash',
  description: 'Small-cash disbursements per branch (LPKK sheet — Laporan Pengeluaran Kas Kecil).',

  // UI Config
  ui: {
    icon: 'Coins',                  // Lucide React icon name
    path: '/dashboard/qsr-petty-cash',
    component: 'QsrPettyCashPage',
    category: 'administration',
    order: 31,
  },

  // Technical Config
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: false,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'beta',                      // development | beta | stable | deprecated
    isReady: true,                      // Backend (qsrPettyCash table + listPettyCash) shipped 2026-05-17. LPKK ETL parser still TODO.
    expectedRelease: undefined,
  },

  // JSON Generation Policy
  generation: {
    mode: 'full-json',
  },

  // Bundle Membership
  // Defines which workspace templates include this feature
  // core: Cannot be disabled | recommended: Enabled by default | optional: User can enable
  bundles: {
    core: [],
    recommended: ["fnb","business-pro"],
    optional: ["custom"],
  },

  // Metadata
  tags: [
    "qsr",
    "fnb",
    "petty-cash"
],
})
