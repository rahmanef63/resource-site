# Implementation Guide: Dynamic Settings System

This guide shows you **step-by-step** how to migrate existing settings to the new dynamic system.

---

##  Migration Overview

### Before (Static Settings)
```
- Settings hardcoded in WorkspaceSettings.tsx
- Each feature has isolated settings
- No automatic integration
- Manual updates required
```

### After (Dynamic Settings)
```
✅ Features auto-register their settings
✅ Automatic cleanup when feature uninstalled
✅ Unified settings UI
✅ Type-safe and extensible
```

---

## 📋 Step 1: Update WorkspaceSettings Page

### Old Implementation
```tsx
// frontend/views/static/workspaces/components/WorkspaceSettings.tsx
export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  // Hardcoded workspace settings only
  return <div>...</div>
}
```

### New Implementation
```tsx
// frontend/views/static/workspaces/page.tsx
"use client"

import { SettingsRegistryProvider, DynamicSettingsView } from '@/frontend/shared/settings'
import { Settings, Users, Shield, Trash2 } from 'lucide-react'
import {
  WorkspaceGeneralSettings,
  WorkspaceMembersSettings,
  WorkspaceSecuritySettings,
  WorkspaceDangerZoneSettings,
} from './components/settings'

export default function WorkspaceSettingsPage({ workspaceId }) {
  // Define core workspace settings
  const coreSettings = [
    {
      id: 'workspace-general',
      label: 'General',
      icon: Settings,
      order: 0,
      component: () => <WorkspaceGeneralSettings workspaceId={workspaceId} />,
    },
    {
      id: 'workspace-members',
      label: 'Members',
      icon: Users,
      order: 1,
      component: () => <WorkspaceMembersSettings workspaceId={workspaceId} />,
      requiredPermission: 'MANAGE_MEMBERS',
    },
    {
      id: 'workspace-security',
      label: 'Security',
      icon: Shield,
      order: 2,
      component: () => <WorkspaceSecuritySettings workspaceId={workspaceId} />,
      requiredPermission: 'MANAGE_WORKSPACE',
    },
    {
      id: 'workspace-danger',
      label: 'Danger Zone',
      icon: Trash2,
      order: 99,
      component: () => <WorkspaceDangerZoneSettings workspaceId={workspaceId} />,
      requiredPermission: 'MANAGE_WORKSPACE',
    },
  ]

  return (
    <SettingsRegistryProvider
      coreSettings={coreSettings}
      defaultCategory="workspace-general"
    >
      <div className="h-screen">
        <DynamicSettingsView />
      </div>
    </SettingsRegistryProvider>
  )
}
```

---

## 📋 Step 2: Split WorkspaceSettings into Components

Break the monolithic `WorkspaceSettings.tsx` into smaller components:

```
frontend/views/static/workspaces/components/settings/
├── WorkspaceGeneralSettings.tsx      # Basic info
├── WorkspaceMembersSettings.tsx      # Member management
├── WorkspaceSecuritySettings.tsx     # Security settings
└── WorkspaceDangerZoneSettings.tsx   # Delete/Reset
```

### Example: WorkspaceGeneralSettings.tsx

```tsx
"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2 } from "lucide-react"

interface WorkspaceGeneralSettingsProps {
  workspaceId: Id<"workspaces">
}

export function WorkspaceGeneralSettings({ workspaceId }: WorkspaceGeneralSettingsProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId })
  const updateWorkspace = useMutation(api.workspace.workspaces.updateWorkspace)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    isPublic: workspace?.isPublic || false,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (workspace) {
      setFormData({
        name: workspace.name || "",
        description: workspace.description || "",
        isPublic: workspace.isPublic || false,
      })
    }
  }, [workspace])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateWorkspace({
        workspaceId,
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        isPublic: formData.isPublic,
      })
      toast({ title: "Settings saved" })
    } catch (error) {
      toast({ title: "Error saving settings", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (!workspace) {
    return <div>Loading...</div>
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold">General Settings</h2>
        <p className="text-muted-foreground">Manage your workspace information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Public Workspace</Label>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📋 Step 3: Add Settings to Chat Feature

### Create Chat Settings Components

```
frontend/slices/chat/settings/
├── ChatGeneralSettings.tsx
├── ChatNotificationSettings.tsx
├── ChatPrivacySettings.tsx
└── index.ts
```

### Register Settings in Chat Feature

```tsx
// frontend/slices/chat/page.tsx or main chat component
"use client"

import { useFeatureSettings } from '@/frontend/shared/settings'
import { MessageSquare, Bell, Lock } from 'lucide-react'
import {
  ChatGeneralSettings,
  ChatNotificationSettings,
  ChatPrivacySettings,
} from './settings'

export function ChatFeature() {
  // Auto-register settings when feature mounts
  useFeatureSettings('wa-chat', [
    {
      id: 'wa-chat-general',
      label: 'Chat General',
      icon: MessageSquare,
      order: 100,
      component: ChatGeneralSettings,
    },
    {
      id: 'wa-chat-notifications',
      label: 'Chat Notifications',
      icon: Bell,
      order: 101,
      component: ChatNotificationSettings,
      badge: 'New',
    },
    {
      id: 'wa-chat-privacy',
      label: 'Chat Privacy',
      icon: Lock,
      order: 102,
      component: ChatPrivacySettings,
    },
  ])

  // Your chat feature UI
  return <div>Chat Content</div>
}
```

---

## 📋 Step 4: Add Settings Icon to Features

Add settings icon that opens settings with the current feature pre-selected:

```tsx
// In any feature component
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsRegistry } from '@/frontend/shared/settings'
import { useRouter } from 'next/navigation'

export function ChatHeader() {
  const router = useRouter()
  const { setActiveCategory } = useSettingsRegistry()

  const handleOpenSettings = () => {
    // Set active category to this feature's first setting
    setActiveCategory('wa-chat-general')
    // Navigate to settings page
    router.push('/dashboard/settings')
  }

  return (
    <div className="flex items-center justify-between">
      <h1>Chat</h1>
      <Button variant="ghost" size="icon" onClick={handleOpenSettings}>
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )
}
```

---

## 📋 Step 5: Update the Feature `config.ts`

Add settings metadata to feature definitions:

```typescript
// frontend/slices/wa-chat/config.ts
export default defineFeature({
  id: "wa-chat",
  name: "Chat",
  hasSettings: true,            // ✨ NEW
  settingsPath: "settings",     // ✨ NEW
  // ... rest of config
})

// frontend/slices/wa-calls/config.ts
export default defineFeature({
  id: "wa-calls",
  name: "Calls",
  hasSettings: true,            // ✨ NEW
  settingsPath: "settings",     // ✨ NEW
  // ... rest of config
})
```

Register the categories inside each feature's `settings/` folder so discovery can pick them up:

```typescript
export const callSettingsCategories = [
  "wa-calls-general",
  "wa-calls-quality",
]
```

---

## 📋 Step 6: Test the Integration

### Test Checklist

- [ ] Open workspace settings
- [ ] Verify core settings appear (General, Members, etc.)
- [ ] Install chat feature
- [ ] Verify chat settings appear automatically
- [ ] Click chat settings icon
- [ ] Verify it opens to correct category
- [ ] Uninstall chat feature
- [ ] Verify chat settings disappear
- [ ] Test on mobile (responsive)
- [ ] Test with permissions (some users see different settings)

---

##  Result

After migration, you'll have:

### Dynamic Settings UI
```
Settings
├── 📁 Core Settings
│   ├── General
│   ├── Members  (if has permission)
│   ├── Security (if has permission)
│   └── Danger Zone (if has permission)
│
├── 📁 Chat (if feature installed)
│   ├── Chat General
│   ├── Chat Notifications
│   └── Chat Privacy
│
├── 📁 Calls (if feature installed)
│   ├── Call Settings
│   └── Video Quality
│
└── 📁 Status (if feature installed)
    └── Status Privacy
```

### Benefits

✅ **Auto-Discovery** - New features auto-register settings
✅ **Clean Separation** - Each feature owns its settings
✅ **Type-Safe** - Full TypeScript support
✅ **Permission-Aware** - Settings respect RBAC
✅ **Mobile-Contactly** - Responsive out of the box
✅ **Maintainable** - Easy to add/remove features

---

##  Next Steps

1. ✅ Migrate WorkspaceSettings to modular components
2. ✅ Add settings to each RAIL_ITEM feature
3. ✅ Add settings icon to feature headers
4. ✅ Update the relevant feature `config.ts`
5. ✅ Test full integration
6. ✅ Document feature-specific settings

---

**Need help?** Check [README.md](./README.md) for full API documentation.
