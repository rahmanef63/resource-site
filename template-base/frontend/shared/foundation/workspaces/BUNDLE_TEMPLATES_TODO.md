# Workspace Bundle Templates - Implementation Guide

## Overview

This document outlines the workspace bundle templates system and what features need to be built.

## ✅ What's Been Implemented

### 1. Bundle Template System (`constants/bundles.ts`)
- 13 pre-configured workspace bundles
- Each bundle has:
  - `core` features (always enabled, cannot be disabled)
  - `recommended` features (enabled by default)
  - `optional` features (disabled by default)

### 2. Robust Onboarding Flow (`RobustOnboardingFlow.tsx`)
- 4-step onboarding process:
  1. Welcome
  2. Workspace Details (name, type, description)
  3. Bundle Selection (visual template picker)
  4. Feature Customization (toggle individual features)

### 3. UI Components
- `BundleSelector.tsx` - Visual grid of bundle templates
- `FeatureCustomizer.tsx` - Toggle features on/off per category

### Available Bundles

| Bundle ID | Name | Category | Best For |
|-----------|------|----------|----------|
| `startup` | Startup | Business | Organizations, Groups |
| `business-pro` | Business Pro | Business | Organizations, Institutions |
| `sales-crm` | Sales & CRM | Business | Organizations, Groups |
| `project-management` | Project Management | Productivity | All team types |
| `knowledge-base` | Knowledge Base | Productivity | Organizations, Institutions |
| `personal-minimal` | Personal Minimal | Personal | Personal |
| `personal-productivity` | Personal Productivity | Personal | Personal |
| `family` | Family Hub | Personal | Family |
| `content-creator` | Content Creator | Creative | Personal, Organizations |
| `digital-agency` | Digital Agency | Creative | Organizations, Groups |
| `education` | Education | Education | Institutions |
| `community` | Community | Community | Groups, Organizations |
| `custom` | Custom | Productivity | All types |

---

## 🔨 TODO: Features To Build

### Priority 1: Essential (Required for Production)

#### 1. Save Workspace Feature Preferences
**Location:** `convex/workspace/workspaces.ts`

```typescript
// TODO: Add mutation to save enabled features
export const saveWorkspaceFeatures = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    enabledFeatures: v.array(v.string()),
    bundleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save to workspace settings or new workspaceFeatures table
  },
})
```

#### 2. Workspace Features Table
**Location:** `convex/features/core/api/schema.ts`

```typescript
// TODO: Add workspaceFeatures table
export const workspaceFeatures = defineTable({
  workspaceId: v.id("workspaces"),
  featureId: v.string(),
  enabled: v.boolean(),
  enabledAt: v.number(),
  enabledBy: v.id("users"),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_feature", ["featureId"])
```

#### 3. Feature Access Control Hook
**Location:** `frontend/shared/foundation/hooks/useWorkspaceFeatures.ts`

```typescript
// TODO: Create hook to check feature access
export function useWorkspaceFeatures(workspaceId: Id<"workspaces">) {
  const features = useQuery(api.workspace.features.getEnabledFeatures, { workspaceId })
  
  return {
    isFeatureEnabled: (featureId: string) => features?.includes(featureId),
    enabledFeatures: features || [],
  }
}
```

---

### Priority 2: Important (Better UX)

#### 4. Dynamic Sidebar Based on Enabled Features
**Location:** `frontend/shared/ui/layout/sidebar/primary/NavSystem.tsx`

Currently, the sidebar shows ALL features. Should be:
- Filter navigation items based on workspace's enabled features
- Show "Enable Feature" prompt for disabled features

#### 5. Bundle Preview Modal
Show a preview of what features are included before selecting a bundle.

#### 6. Feature Comparison View
Allow users to compare bundles side-by-side.

---

### Priority 3: Nice to Have (Enhancement)

#### 7. Bundle Marketplace
Allow users to share custom bundles with the community.

#### 8. Bundle Analytics
Track which bundles are most popular.

#### 9. AI Bundle Recommendation
Suggest bundles based on workspace description.

---

## 📋 Database Schema Changes Needed

```typescript
// New table: workspaceFeatures
workspaceFeatures: defineTable({
  workspaceId: v.id("workspaces"),
  featureId: v.string(),
  enabled: v.boolean(),
  bundleId: v.optional(v.string()), // Which bundle was used
  customized: v.boolean(), // Was it customized after bundle selection?
  enabledAt: v.number(),
  enabledBy: v.id("users"),
})

// Extend workspaces table
workspaces: defineTable({
  // ... existing fields
  bundleId: v.optional(v.string()), // Selected bundle template
  featuresCustomized: v.optional(v.boolean()),
})
```

---

## 🔗 Integration Points

### Sidebar Navigation
```typescript
// In NavSystem.tsx or AppSidebar.tsx
const { isFeatureEnabled } = useWorkspaceFeatures(workspaceId)

// Filter navigation items
const visibleNavItems = WORKSPACE_NAVIGATION_ITEMS.filter(
  item => isFeatureEnabled(item.key)
)
```

### Feature Guard Component
```typescript
// Create a guard for protected feature routes
export function FeatureGuard({ 
  featureId, 
  children, 
  fallback 
}: { 
  featureId: string
  children: ReactNode
  fallback?: ReactNode 
}) {
  const { isFeatureEnabled } = useWorkspaceFeatures(workspaceId)
  
  if (!isFeatureEnabled(featureId)) {
    return fallback || <FeatureNotEnabled featureId={featureId} />
  }
  
  return <>{children}</>
}
```

---

## Testing Checklist

- [ ] Create workspace with each bundle
- [ ] Verify correct features are enabled
- [ ] Toggle features on/off in customizer
- [ ] Verify sidebar shows only enabled features
- [ ] Test switching bundles during onboarding
- [ ] Test "Custom" bundle with manual feature selection
