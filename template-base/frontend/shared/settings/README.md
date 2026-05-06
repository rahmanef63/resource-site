# Dynamic Settings System

A powerful, extensible settings registry system that allows features to **dynamically register their own settings** that automatically appear in the workspace settings UI.

##  Key Features

- ✅ **Dynamic Registration** - Features auto-register settings when installed
- ✅ **Auto-Cleanup** - Settings auto-unregister when features uninstalled
- ✅ **Type-Safe** - Fully typed with TypeScript
- ✅ **Permission-Aware** - Settings can require specific permissions
- ✅ **Responsive** - Mobile-first with adaptive layouts
- ✅ **Grouped** - Settings can be grouped by feature
- ✅ **Extensible** - Easy to add new settings categories

---

## 📁 Structure

```
frontend/shared/settings/
├── types.ts                          # Type definitions
├── SettingsRegistry.tsx              # Core registry system
├── components/
│   ├── DynamicSettingsSidebar.tsx    # Auto-rendering sidebar
│   ├── DynamicSettingsView.tsx       # Main settings view
│   └── index.ts
├── hooks/
│   ├── useFeatureSettings.ts         # Hook for features
│   └── index.ts
├── index.ts
└── README.md                         # This file
```

---

##  Quick Start

### 1. Wrap Your App with SettingsRegistryProvider

```tsx
// app/layout.tsx or similar
import { SettingsRegistryProvider } from '@/frontend/shared/settings'
import { Settings, User } from 'lucide-react'

const coreSettings = [
  {
    id: 'workspace-general',
    label: 'General',
    icon: Settings,
    order: 0,
    component: WorkspaceGeneralSettings,
  },
  {
    id: 'workspace-members',
    label: 'Members',
    icon: User,
    order: 1,
    component: WorkspaceMembersSettings,
  },
]

export default function RootLayout({ children }) {
  return (
    <SettingsRegistryProvider
      coreSettings={coreSettings}
      defaultCategory="workspace-general"
    >
      {children}
    </SettingsRegistryProvider>
  )
}
```

### 2. Register Feature Settings

```tsx
// features/chat/ChatFeature.tsx
import { useFeatureSettings } from '@/frontend/shared/settings'
import { MessageSquare, Bell, Palette } from 'lucide-react'
import {
  ChatGeneralSettings,
  ChatNotificationSettings,
  ChatAppearanceSettings,
} from './settings'

export function ChatFeature() {
  // Auto-register settings when feature mounts
  useFeatureSettings('wa-chat', [
    {
      id: 'chat-general',
      label: 'General',
      icon: MessageSquare,
      order: 100,
      component: ChatGeneralSettings,
    },
    {
      id: 'chat-notifications',
      label: 'Notifications',
      icon: Bell,
      order: 101,
      component: ChatNotificationSettings,
      badge: 'New',
    },
    {
      id: 'chat-appearance',
      label: 'Appearance',
      icon: Palette,
      order: 102,
      component: ChatAppearanceSettings,
    },
  ])

  return <div>Chat Feature Content</div>
}
```

### 3. Render Settings UI

```tsx
// app/dashboard/settings/page.tsx
import { DynamicSettingsView } from '@/frontend/shared/settings'

export default function SettingsPage() {
  return (
    <div className="h-screen">
      <DynamicSettingsView
        showMobileBack={true}
        onBack={() => router.back()}
      />
    </div>
  )
}
```

---

## 📖 API Reference

### `SettingsRegistryProvider`

Provider component that manages the settings registry.

**Props:**
```tsx
interface SettingsRegistryProviderProps {
  children: React.ReactNode
  coreSettings?: SettingsCategory[]
  defaultCategory?: string
}
```

**Example:**
```tsx
<SettingsRegistryProvider
  coreSettings={workspaceSettings}
  defaultCategory="workspace-general"
>
  <App />
</SettingsRegistryProvider>
```

---

### `useSettingsRegistry()`

Access the settings registry context.

**Returns:**
```tsx
{
  categories: SettingsCategory[]
  activeCategory: string | null
  setActiveCategory: (id: string) => void
  registerSettings: (payload: RegisterSettingsPayload) => void
  unregisterSettings: (featureSlug: string) => void
  getFeatureSettings: (featureSlug: string) => SettingsCategory[]
  hasSettings: (featureSlug: string) => boolean
}
```

**Example:**
```tsx
const { categories, activeCategory, setActiveCategory } = useSettingsRegistry()
```

---

### `useFeatureSettings()`

Hook for features to register their settings.

**Parameters:**
```tsx
useFeatureSettings(
  featureSlug: string,
  categories: Omit<SettingsCategory, 'featureSlug'>[],
  options?: {
    enabled?: boolean
  }
)
```

**Returns:**
```tsx
{
  hasSettings: boolean
  settings: SettingsCategory[]
  register: (newCategories) => void
}
```

**Example:**
```tsx
const { hasSettings, settings } = useFeatureSettings('wa-chat', [
  {
    id: 'chat-privacy',
    label: 'Privacy',
    icon: Lock,
    order: 150,
    component: ChatPrivacySettings,
    requiredPermission: 'MANAGE_CHAT_SETTINGS',
  }
])
```

---

### `DynamicSettingsView`

Main settings view component with responsive layout.

**Props:**
```tsx
interface DynamicSettingsViewProps {
  className?: string
  showMobileBack?: boolean
  onBack?: () => void
}
```

**Example:**
```tsx
<DynamicSettingsView
  showMobileBack={true}
  onBack={() => console.log('Back clicked')}
/>
```

---

### `DynamicSettingsSidebar`

Sidebar that auto-renders all registered settings.

**Props:**
```tsx
interface DynamicSettingsSidebarProps {
  className?: string
  groupByFeature?: boolean
  showFeatureBadges?: boolean
}
```

**Example:**
```tsx
<DynamicSettingsSidebar
  groupByFeature={true}
  showFeatureBadges={false}
/>
```

---

## 🎨 Complete Example

### Feature with Settings

```tsx
// features/calls/CallsFeature.tsx
import { useFeatureSettings } from '@/frontend/shared/settings'
import { Phone, Bell, Video } from 'lucide-react'

function CallsFeature() {
  // Register settings
  useFeatureSettings('wa-calls', [
    {
      id: 'calls-general',
      label: 'Call Settings',
      icon: Phone,
      order: 200,
      component: CallGeneralSettings,
    },
    {
      id: 'calls-notifications',
      label: 'Call Notifications',
      icon: Bell,
      order: 201,
      component: CallNotificationSettings,
    },
    {
      id: 'calls-quality',
      label: 'Video Quality',
      icon: Video,
      order: 202,
      component: CallQualitySettings,
    },
  ])

  return <div>Calls Feature UI</div>
}

// Settings component example
function CallGeneralSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Call Settings</h2>
        <p className="text-muted-foreground">
          Configure your call preferences
        </p>
      </div>

      {/* Your settings UI */}
      <div className="space-y-4">
        {/* Settings controls here */}
      </div>
    </div>
  )
}
```

### Workspace Settings Integration

```tsx
// features/workspace/WorkspaceSettingsPage.tsx
import { SettingsRegistryProvider, DynamicSettingsView } from '@/frontend/shared/settings'
import { Settings, Users, Shield } from 'lucide-react'
import { WorkspaceGeneralSettings, WorkspaceMembersSettings } from './settings'

const coreSettings = [
  {
    id: 'workspace-general',
    label: 'General',
    icon: Settings,
    order: 0,
    featureSlug: null, // Core setting
    component: WorkspaceGeneralSettings,
  },
  {
    id: 'workspace-members',
    label: 'Members',
    icon: Users,
    order: 1,
    featureSlug: null,
    component: WorkspaceMembersSettings,
    requiredPermission: 'MANAGE_MEMBERS',
  },
  {
    id: 'workspace-security',
    label: 'Security',
    icon: Shield,
    order: 2,
    featureSlug: null,
    component: WorkspaceSecuritySettings,
    requiredPermission: 'MANAGE_WORKSPACE',
  },
]

export function WorkspaceSettingsPage() {
  return (
    <SettingsRegistryProvider
      coreSettings={coreSettings}
      defaultCategory="workspace-general"
    >
      <DynamicSettingsView />
    </SettingsRegistryProvider>
  )
}
```

---

## 🔄 How It Works

### Registration Flow

```
1. Feature mounts
   └─> useFeatureSettings() called
       └─> registerSettings() adds categories to registry

2. Settings UI renders
   └─> DynamicSettingsSidebar reads from registry
       └─> Shows all registered categories

3. User clicks category
   └─> setActiveCategory() updates state
       └─> DynamicSettingsView renders active component

4. Feature unmounts
   └─> useFeatureSettings cleanup
       └─> unregisterSettings() removes categories
```

### Example Flow

```
User installs "Calls" feature
  → CallsFeature component mounts
  → useFeatureSettings registers 3 categories
  → Settings sidebar updates (shows new items)
  → User sees: "Call Settings", "Call Notifications", "Video Quality"

User uninstalls "Calls" feature
  → CallsFeature component unmounts
  → useFeatureSettings cleanup runs
  → unregisterSettings('wa-calls') called
  → Settings sidebar updates (removes items)
```

---

##  Best Practices

### 1. **Use Consistent Ordering**

```tsx
// Core settings: 0-99
{ order: 0 }  // Workspace General
{ order: 10 } // Workspace Members

// Feature settings: 100+
{ order: 100 } // Chat settings
{ order: 200 } // Calls settings
{ order: 300 } // Status settings
```

### 2. **Namespace Category IDs**

```tsx
// ✅ Good: Namespaced with feature
{ id: 'wa-chat-general' }
{ id: 'wa-calls-quality' }

// ❌ Bad: Generic IDs (can conflict)
{ id: 'general' }
{ id: 'notifications' }
```

### 3. **Use Meaningful Labels**

```tsx
// ✅ Good: Clear and descriptive
{ label: 'Chat Notifications' }
{ label: 'Video Quality' }

// ❌ Bad: Too generic
{ label: 'Settings' }
{ label: 'Options' }
```

### 4. **Add Permissions Where Needed**

```tsx
{
  id: 'chat-admin',
  label: 'Admin Settings',
  requiredPermission: 'MANAGE_CHAT_SETTINGS',
  component: ChatAdminSettings,
}
```

### 5. **Use Badges for Highlights**

```tsx
{
  id: 'chat-ai',
  label: 'AI Features',
  badge: 'New',      // Highlight new features
  component: ChatAISettings,
}
```

---

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react'
import { SettingsRegistryProvider, useFeatureSettings } from '@/frontend/shared/settings'

describe('Settings System', () => {
  it('registers feature settings', () => {
    const TestFeature = () => {
      useFeatureSettings('test-feature', [
        { id: 'test-1', label: 'Test Setting', icon: Settings, order: 100, component: () => <div>Test</div> }
      ])
      return null
    }

    render(
      <SettingsRegistryProvider>
        <TestFeature />
      </SettingsRegistryProvider>
    )

    // Verify settings are registered
  })
})
```

---

## 📚 Related Documentation

- [Feature Package System](../../../docs/1_SYSTEM_OVERVIEW.md#feature-package-system)
- [RBAC System](../../../docs/1_SYSTEM_OVERVIEW.md#rbac)
- [Shared Components](../components/README.md)

---

## 🆘 Troubleshooting

### Settings not showing up

1. Verify `SettingsRegistryProvider` wraps your app
2. Check that `useFeatureSettings` is called in a mounted component
3. Ensure `order` values don't conflict

### Settings not cleaning up

1. Verify component unmounts properly
2. Check that `useFeatureSettings` cleanup runs
3. Ensure `featureSlug` is consistent

### Permission errors

1. Verify user has required permission
2. Check RBAC configuration
3. Ensure permission checks in component

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
