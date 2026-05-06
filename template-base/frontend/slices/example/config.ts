/**
 * ============================================================================
 * EXAMPLE FEATURE - config.ts
 * ============================================================================
 * 
 * This is the SINGLE SOURCE OF TRUTH (SSOT) for your feature.
 * The auto-discovery system reads this file to register your feature.
 * 
 * WHAT HAPPENS AUTOMATICALLY:
 * 1. Feature appears in sidebar navigation
 * 2. Route is created at the specified path
 * 3. Feature is added to the registry
 * 4. Permissions are registered in RBAC system
 * 
 * REQUIRED FIELDS:
 * - id: Unique kebab-case identifier (must match folder name)
 * - name: Display name in the UI
 * - ui.icon: Lucide icon name (see https://lucide.dev/icons)
 * - ui.path: URL path for this feature
 * 
 * TIPS:
 * - Keep id simple and descriptive
 * - Use consistent naming: folder 'example' → id 'example'
 * - Check existing features for bundle names
 */

import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

export default defineFeature({
  // =========================================================================
  // IDENTITY - Who is this feature?
  // =========================================================================
  
  /**
   * Unique identifier (kebab-case)
   * MUST match the folder name: frontend/slices/example/
   */
  id: 'example',
  
  /**
   * Display name shown in sidebar and breadcrumbs
   */
  name: 'Example Feature',
  
  /**
   * Brief description for tooltips and documentation
   */
  description: 'A minimal example feature demonstrating SuperSpace patterns and conventions',

  // =========================================================================
  // UI - How does this feature appear?
  // =========================================================================
  
  ui: {
    /**
     * Lucide icon name (without 'Icon' suffix)
     * Browse icons at: https://lucide.dev/icons
     */
    icon: 'Lightbulb',
    
    /**
     * URL path where this feature lives
     * Format: /dashboard/{category}/{feature}
     */
    path: '/dashboard/example',
    
    /**
     * Component name (for dynamic loading)
     * Should match your page.tsx default export name
     */
    component: 'ExamplePage',
    
    /**
     * Sidebar category grouping
     * Options: 'content', 'analytics', 'communication', 'productivity', 
     *          'collaboration', 'administration', 'social', 'creativity'
     */
    category: 'productivity',
    
    /**
     * Sort order within category (lower = higher in list)
     */
    order: 999,
  },

  // =========================================================================
  // TECHNICAL - Implementation details
  // =========================================================================
  
  technical: {
    /**
     * Feature type:
     * - 'core': Always enabled, essential functionality
     * - 'optional': Can be enabled/disabled per workspace
     * - 'addon': Requires additional setup/license
     */
    featureType: 'optional',
    
    /**
     * Does this feature have a UI? (Most do)
     */
    hasUI: true,
    
    /**
     * Does this feature have Convex backend?
     * If true, must have convex/features/{camelCaseId}/ folder
     */
    hasConvex: true,
    
    /**
     * Does this feature have tests?
     */
    hasTests: true,
    
    /**
     * Semantic version for tracking changes
     */
    version: '1.0.0',
  },

  // =========================================================================
  // DEPENDENCIES - What does this feature need?
  // =========================================================================
  
  /**
   * List of feature IDs this feature depends on
   * Those features must be enabled for this to work
   */
  dependencies: [],

  // =========================================================================
  // STATUS - Is it ready?
  // =========================================================================
  
  status: {
    /**
     * Development state:
     * - 'draft': In development, not visible
     * - 'alpha': Early testing
     * - 'beta': Feature complete, needs polish
     * - 'stable': Production ready
     */
    state: 'stable',
    
    /**
     * Can users access this feature?
     */
    isReady: true,
  },

  // =========================================================================
  // BUNDLES - Which workspace types include this?
  // =========================================================================
  
  bundles: {
    /**
     * Workspace types where this is always enabled
     */
    core: [],
    
    /**
     * Workspace types where this is recommended
     */
    recommended: [],
    
    /**
     * Workspace types where this is available as add-on
     */
    optional: ["startup", "business-pro"],
  },

  // =========================================================================
  // PERMISSIONS - What can users do?
  // =========================================================================
  
  /**
   * Permission strings used in RBAC checks
   * Format: {feature}.{resource}.{action}
   * 
   * Check these in your Convex mutations:
   *   await requirePermission(ctx, workspaceId, 'example.items.create')
   */
  permissions: [
    'example.view',      // Can view the feature
    'example.create',    // Can create items
    'example.edit',      // Can edit items
    'example.delete',    // Can delete items
  ],

  // =========================================================================
  // TAGS - Searchability
  // =========================================================================
  
  /**
   * Keywords for search and categorization
   */
  tags: ["example", "demo", "tutorial", "learning"],
})
