# Header System

Unified header components for consistent UI across the application.

## Features

- **5 Core Header presets**: feature, sidebar, container, page, minimal
- **Compound component pattern**: `<Header.Title>`, `<Header.Actions>`, `<Header.Breadcrumbs>`
- **5 Size variants**: xs, sm, md, lg, xl
- **7 Visual variants**: default, minimal, compact, elevated, transparent, sticky, floating
- **4 Layout types**: standard, centered, split, stacked
- **Dynamic updates**: Context-based header updates from child components
- **Full TypeScript support**: Comprehensive type definitions

## Quick Start

### Feature Header (Most Common)

```tsx
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { FileText, Plus } from "lucide-react"

<FeatureHeader
  title="Documents"
  subtitle="Manage your documents"
  icon={FileText}
  primaryAction={{
    label: "Add Document",
    icon: Plus,
    onClick: handleAdd,
  }}
  badge={{ text: "Beta", variant: "secondary" }}
  meta={[
    { label: "Total", value: 42 },
    { label: "Updated", value: "2 hours ago" },
  ]}
/>
```

### Sidebar Header

```tsx
import { SidebarHeader } from "@/frontend/shared/ui/layout/header"

<SidebarHeader
  title="Conversations"
  subtitle="24 active"
  onSettings={() => openSettings()}
  onAdd={() => createNew()}
  search={{
    value: searchQuery,
    onChange: setSearchQuery,
    placeholder: "Search conversations...",
  }}
/>
```

### Container Header

```tsx
import { ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { Folder } from "lucide-react"

<ContainerHeader
  title="Project Files"
  subtitle="12 items"
  icon={Folder}
  showBack
  onBack={() => router.back()}
  collapsible
  isCollapsed={isCollapsed}
  onToggleCollapse={toggleCollapse}
  actions={<Button variant="ghost" size="icon"><Settings /></Button>}
/>
```

## Compound Component Pattern

For more control, use the compound component pattern:

```tsx
import { Header } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Home, Settings, Plus } from "lucide-react"

<Header variant="default" size="lg" border>
  {/* Breadcrumbs */}
  <Header.Breadcrumbs
    items={[
      { label: "Home", href: "/", icon: Home },
      { label: "Documents", href: "/documents" },
      { label: "Project A", isCurrent: true },
    ]}
  />
  
  {/* Title with icon */}
  <Header.Title
    title="Project A Documents"
    subtitle="Manage project files"
    icon={FolderOpen}
    iconSize="lg"
  />
  
  {/* Badge */}
  <Header.Badge text="Beta" variant="secondary" />
  
  {/* Meta info */}
  <Header.Meta
    items={[
      { label: "Files", value: 24 },
      { label: "Size", value: "1.2 GB" },
    ]}
    separator="dot"
  />
  
  {/* Actions */}
  <Header.Actions>
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add File
    </Button>
  </Header.Actions>
</Header>

{/* Optional toolbar row */}
<Header.Toolbar>
  <FilterButtons />
  <ViewToggle />
</Header.Toolbar>
```

## All Presets

### FeatureHeader
Main feature page header with icon, title, description, breadcrumbs, and primary action.

```tsx
<FeatureHeader
  title="Tasks"
  subtitle="Manage your tasks"
  icon={CheckSquare}
  breadcrumbs={[...]}
  primaryAction={{ label: "Add Task", icon: Plus, onClick: handleAdd }}
  badge={{ text: "New", variant: "success" }}
  meta={[{ label: "Total", value: 128 }]}
  toolbar={<FilterButtons />}
/>
```

### SidebarHeader
Compact header for sidebars with optional search.

```tsx
<SidebarHeader
  title="Chats"
  subtitle="12 online"
  onSettings={handleSettings}
  onAdd={handleNewChat}
  search={{ value, onChange, placeholder: "Search..." }}
/>
```

### ContainerHeader
Panel/container header with back button and collapse support.

```tsx
<ContainerHeader
  title="Details"
  icon={Info}
  showBack
  onBack={handleBack}
  collapsible
  isCollapsed={collapsed}
  onToggleCollapse={toggle}
/>
```

### PageHeader
Full-width page header with breadcrumbs.

```tsx
<PageHeader
  title="Dashboard"
  description="Welcome back, user!"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
  primaryAction={{ label: "Refresh", onClick: refresh }}
/>
```

### MinimalHeader
Bare minimum header.

```tsx
<MinimalHeader
  title="Settings"
  actions={<Button>Save</Button>}
/>
```

## Dynamic Header Updates

Update header content from child components:

```tsx
import { DynamicHeaderProvider, useDynamicHeader } from "@/frontend/shared/ui/layout/header"

// Parent: Wrap with provider
<DynamicHeaderProvider>
  <Header>
    <DynamicTitle />
    <DynamicActions />
  </Header>
  <Content />
</DynamicHeaderProvider>

// Child: Update header
function DocumentView({ document }) {
  const { setTitle, setActions } = useDynamicHeader()
  
  useEffect(() => {
    setTitle(document.name)
    setActions(<Button onClick={save}>Save</Button>)
  }, [document])
  
  return <Editor />
}
```

## Styling Utilities

For custom implementations, use the style utilities:

```tsx
import {
  getHeaderContainerClasses,
  getTitleClasses,
  getActionsContainerClasses,
} from "@/frontend/shared/ui/layout/header"

<div className={getHeaderContainerClasses({
  variant: "elevated",
  size: "lg",
  sticky: true,
})}>
  <h1 className={getTitleClasses({ size: "lg" })}>
    Custom Header
  </h1>
</div>
```

## Presets Configuration

Access preset configurations:

```tsx
import { HEADER_PRESETS } from "@/frontend/shared/ui/layout/header"

// Apply preset manually
<Header {...HEADER_PRESETS.feature}>
  ...
</Header>

// Available presets:
// - feature, sidebar, container, page, minimal
```

## File Structure

```
header/
├── index.ts      # Public exports
├── types.ts      # Type definitions
├── context.tsx   # React context providers
├── styles.ts     # CSS class utilities
├── Header.tsx    # Compound components
├── presets.tsx   # Pre-configured headers
└── README.md     # This file
```

## Migration from Old Headers

Replace old header implementations:

```tsx
// Before
<div className="flex items-center justify-between p-4 border-b">
  <div>
    <h1 className="text-xl font-bold">Page Title</h1>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  <Button onClick={handleAdd}>
    <Plus className="h-4 w-4 mr-2" />
    Add
  </Button>
</div>

// After
<FeatureHeader
  title="Page Title"
  subtitle="Description"
  primaryAction={{
    label: "Add",
    icon: Plus,
    onClick: handleAdd,
  }}
/>
```
