# Unified Sidebar System

> **Comprehensive, modular sidebar system combining primary navigation, secondary sidebars, and the new variant registry pattern**

**Last Updated:** 2025-11-02
**Version:** 3.0.0 (Registry Pattern)

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Primary Sidebar](#primary-sidebar)
4. [Secondary Sidebar](#secondary-sidebar)
5. [**NEW: Variant Registry System**](#variant-registry-system)
6. [Usage Examples](#usage-examples)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)

---

## Overview

The Unified Sidebar System provides:

- **Primary Sidebar**: App-level navigation (workspaces, features, settings)
- **Secondary Sidebar**: Feature-level navigation and content lists
- **Variant Registry**: Extensible item rendering without hardcoding
- **Shared Components**: Breadcrumbs, headers, toolbars

### Key Features

✅ **Type-safe** - Full TypeScript coverage
✅ **Extensible** - Add custom variants without touching core
✅ **Composable** - Use components individually or together
✅ **Accessible** - WCAG 2.1 AA compliant
✅ **Performant** - Virtualization support for large lists

---

## Directory Structure

```
frontend/shared/ui/layout/sidebar/
├── primary/                    # Main App Sidebar
│   ├── AppSidebar.tsx
│   ├── WorkspaceSwitcher.tsx
│   ├── NavMain.tsx
│   ├── NavSecondary.tsx
│   ├── NavSystem.tsx
│   ├── NavUser.tsx
│   └── index.ts
├── secondary/                  # Feature-Specific Sidebars
│   ├── components/
│   │   ├── SecondarySidebarLayout.tsx
│   │   ├── SecondarySidebarHeader.tsx
│   │   ├── SecondarySidebar.tsx
│   │   ├── SecondarySidebarTools.tsx
│   │   └── SecondaryList.tsx         # NEW: Registry-based list
│   ├── lib/
│   │   ├── variant-registry.ts       # NEW: Core registry
│   │   └── built-in-variants.tsx     # NEW: Built-in variants
│   └── index.ts
├── components/                 # Shared Utilities
│   ├── breadcrumbs-context.tsx
│   ├── onboarding-guard.tsx
│   ├── site-header.tsx
│   ├── state-pages.tsx
│   ├── loading-bar.tsx
│   └── index.ts
├── index.ts
└── README.md                   # This file
```

---

## Primary Sidebar

### Purpose

Main application navigation for dashboard-level features.

### Components

- **AppSidebar**: Main container orchestrating all nav components
- **WorkspaceSwitcher**: Workspace selection dropdown
- **NavMain**: Primary navigation items
- **NavSecondary**: Bottom navigation (Support, Feedback)
- **NavSystem**: System menu items (Settings, etc.)
- **NavUser**: User profile and account menu

### Usage

```tsx
import { AppSidebar } from "@/frontend/shared/ui/layout/sidebar";

<SidebarProvider>
  <AppSidebar workspaceId={workspaceId} />
  <SidebarInset>
    {children}
  </SidebarInset>
</SidebarProvider>
```

---

## Secondary Sidebar

### Purpose

Feature-specific navigation, content lists, and tools.

### Components

#### 1. **SecondarySidebarLayout**
Main container with header, sidebar, and content areas.

```tsx
<SecondarySidebarLayout
  headerProps={{
    title: "Documents",
    toolbar: <SecondarySidebarTools />,
  }}
  sidebarProps={{
    sections: [...],
  }}
>
  {children}
</SecondarySidebarLayout>
```

#### 2. **SecondarySidebarHeader**
Header with title, actions, breadcrumbs, toolbar.

#### 3. **SecondarySidebar**
Sidebar with customizable sections and items.

#### 4. **SecondarySidebarTools**
Search, sort, filter, and view toggle controls.

#### 5. **SecondaryList** ⭐ NEW
Registry-based list renderer (see below).

---

## Variant Registry System

### 🎯 What's New?

The Variant Registry System eliminates hardcoded item rendering logic. Instead of `if/else` or `switch` statements, **register variants** and let the system handle rendering.

### Core Concepts

#### 1. **Variant Definition**

A variant defines:
- **ID**: Unique identifier (e.g., `"chat"`, `"call"`, `"doc"`)
- **Params Schema**: Zod schema for type-safe parameters
- **Render Function**: How to display the item

 ```tsx
 import { z } from "zod";
 import Image from "next/image";
 import { createVariant } from "@/frontend/shared/ui/layout/sidebar/secondary";

const ChatParams = z.object({
  lastMessage: z.string(),
  lastAt: z.string(),
  unread: z.number().optional(),
});

   const chatVariant = createVariant({
     id: "chat",
     title: "Chat Conversation",
     paramsSchema: ChatParams,
     render: ({ item, params, utils }) => (
       <div className="flex items-center gap-3 px-3 py-2">
      <Image src={item.avatarUrl} alt="" width={40} height={40} className="size-10 rounded-full" />
         <div className="flex-1">
           <div className="font-medium">{item.label}</div>
           <div className="text-xs text-muted-foreground truncate">
             {params.lastMessage}
           </div>
         </div>
         <time className="text-xs">{utils.formatTime(params.lastAt)}</time>
       </div>
     ),
   });
 ```

#### 2. **Registration**

```tsx
import { itemVariantRegistry } from "@/frontend/shared/ui/layout/sidebar/secondary";

// Register the variant
itemVariantRegistry.register(chatVariant);
```

#### 3. **Usage in Data**

```tsx
import { itemVariant, SecondaryItem } from "@/frontend/shared/ui/layout/sidebar/secondary";

const items: SecondaryItem[] = [
  {
    id: "1",
    label: "AI Assistant",
    avatarUrl: "/ai.png",
    variantId: itemVariant.chat,
    params: {
      lastMessage: "How can I help?",
      lastAt: new Date().toISOString(),
      unread: 3,
    },
  },
];
```

#### 4. **Rendering**

```tsx
import { SecondaryList } from "@/frontend/shared/ui/layout/sidebar/secondary";

<SecondaryList
  items={items}
  onAction={(id, action) => console.log(id, action)}
/>
```

### Built-in Variants

The system includes 6 built-in variants:

| Variant | ID | Use Case | Key Params |
|---------|-----|----------|------------|
| **Chat** | `chat` | Conversations | `lastMessage`, `lastAt`, `unread`, `online` |
| **Call** | `call` | Voice/video calls | `direction`, `medium`, `duration`, `ongoing` |
| **Doc** | `doc` | Documents/files | `iconId`, `lastModified`, `size`, `type` |
| **Menu** | `menu` | Tree navigation | `isFolder`, `depth`, `hidden`, `childCount` |
| **Status** | `status` | Stories/updates | `createdAt`, `tags`, `seen`, `imageUrl` |
| **List** | `list` | Generic fallback | `description`, `badge`, `timestamp` |

#### Example: Chat Variant

```tsx
const items: SecondaryItem[] = [
  {
    id: "chat-1",
    label: "AI Assistant",
    avatarUrl: "/ai.png",
    variantId: itemVariant.chat,
    params: {
      lastMessage: "How can I help you today?",
      lastAt: "2025-11-02T08:30:00Z",
      unread: 2,
      online: true,
      ai: true,
    },
  },
];
```

#### Example: Call Variant

```tsx
const items: SecondaryItem[] = [
  {
    id: "call-1",
    label: "Team Standup",
    variantId: itemVariant.call,
    params: {
      direction: "in",
      medium: "video",
      group: true,
      ongoing: true,
      timestamp: "2025-11-02T09:00:00Z",
    },
  },
];
```

#### Example: Menu Variant (Tree with Actions)

```tsx
const items: SecondaryItem[] = [
  {
    id: "folder-1",
    label: "Projects",
    variantId: itemVariant.menu,
    params: {
      isFolder: true,
      depth: 0,
      childCount: 5,
    },
  },
  {
    id: "item-1",
    label: "Website Redesign",
    variantId: itemVariant.menu,
    params: {
      isFolder: false,
      depth: 1,
    },
  },
];
```

### Custom Variants

Create custom variants for your feature:

```tsx
// In your feature: features/crm/lib/deal-variant.ts
import { z } from "zod";
import { createVariant, itemVariantRegistry, itemVariant } from "@/frontend/shared/ui/layout/sidebar/secondary";

const DealParams = z.object({
  stage: z.enum(["new", "qualified", "won", "lost"]),
  amount: z.number(),
  updatedAt: z.string(),
});

const dealVariant = createVariant({
  id: "crm.deal",
  title: "CRM Deal",
  paramsSchema: DealParams,
  render: ({ item, params, utils }) => (
    <div className="flex items-center gap-3 px-3 py-2">
      <Badge variant="outline">{params.stage}</Badge>
      <div className="flex-1">
        <div className="font-medium">{item.label}</div>
        <div className="text-xs text-muted-foreground">
          {utils.formatCurrency(params.amount)}
        </div>
      </div>
      <time className="text-xs">{utils.formatTime(params.updatedAt)}</time>
    </div>
  ),
});

// Register it
itemVariantRegistry.register(dealVariant);

// Use it
const items: SecondaryItem[] = [
  {
    id: "deal-1",
    label: "ACME Corp Deal",
    variantId: itemVariant.custom("crm.deal"),
    params: {
      stage: "qualified",
      amount: 50000,
      updatedAt: new Date().toISOString(),
    },
  },
];
```

### SecondaryList Props

```typescript
interface SecondaryListProps {
  items: SecondaryItem[];
  loading?: boolean;
  error?: string | Error;
  emptyState?: ReactNode;
  emptyText?: string;
  renderUnknown?: (ctx: RenderCtx) => ReactNode;
  onAction?: (id: string, action: string, extra?: any) => void;
  slots?: {
    leading?: ReactNode;
    trailing?: ReactNode;
    badge?: ReactNode;
  };
  utils?: Partial<RenderUtils>;
  className?: string;
  virtualize?: boolean;
  loadingCount?: number;
}
```

---

## Usage Examples

### Example 1: Basic Feature Page with Secondary Sidebar

```tsx
import { SecondarySidebarLayout, SecondarySidebarTools } from "@/frontend/shared/ui/layout/sidebar/secondary";

export default function MyFeaturePage() {
  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "My Feature",
        toolbar: <SecondarySidebarTools />,
      }}
      sidebarProps={{
        sections: [
          {
            title: "Navigation",
            items: [
              { id: "1", label: "Item 1", onClick: () => {} },
            ],
          },
        ],
      }}
    >
      <div className="p-6">Main content</div>
    </SecondarySidebarLayout>
  );
}
```

### Example 2: Chat Feature with Registry

```tsx
import {
  SecondarySidebarLayout,
  SecondaryList,
  itemVariant,
  type SecondaryItem,
} from "@/frontend/shared/ui/layout/sidebar/secondary";

export default function ChatPage() {
  const chats: SecondaryItem[] = [
    {
      id: "1",
      label: "AI Assistant",
      avatarUrl: "/ai.png",
      variantId: itemVariant.chat,
      params: {
        lastMessage: "How can I help?",
        lastAt: new Date().toISOString(),
        unread: 3,
        online: true,
      },
    },
  ];

  return (
    <SecondarySidebarLayout
      sidebar={
        <aside className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Chats</h2>
          </div>
          <SecondaryList
            items={chats}
            onAction={(id, action) => {
              if (action === "select") {
                // Handle chat selection
              }
            }}
          />
        </aside>
      }
    >
      <ChatView />
    </SecondarySidebarLayout>
  );
}
```

### Example 3: Menu Store with Tree

```tsx
import {
  SecondarySidebarLayout,
  SecondaryList,
  itemVariant,
} from "@/frontend/shared/ui/layout/sidebar/secondary";

export default function MenuStorePage() {
  const menuItems: SecondaryItem[] = [
    {
      id: "root",
      label: "Dashboard",
      variantId: itemVariant.menu,
      params: { isFolder: true, depth: 0, childCount: 3 },
    },
    {
      id: "overview",
      label: "Overview",
      variantId: itemVariant.menu,
      params: { depth: 1 },
    },
  ];

  return (
    <SecondarySidebarLayout
      headerProps={{ title: "Menu Store" }}
      sidebar={
        <aside className="w-80 border-r flex flex-col">
          <SecondaryList
            items={menuItems}
            onAction={(id, action) => {
              // Handle menu actions (rename, delete, etc.)
            }}
          />
        </aside>
      }
    >
      <MenuPreview />
    </SecondarySidebarLayout>
  );
}
```

---

## Migration Guide

### From Old Secondary Sidebar

**Before (items prop):**
```tsx
<SecondarySidebar
  sections={[
    {
      items: [
        { id: "1", label: "Chat 1", description: "Last message..." },
      ],
    },
  ]}
/>
```

**After (with registry):**
```tsx
<SecondaryList
  items={[
    {
      id: "1",
      label: "Chat 1",
      variantId: itemVariant.chat,
      params: {
        lastMessage: "Last message...",
        lastAt: new Date().toISOString(),
      },
    },
  ]}
/>
```

### Migrating Custom Rendering

**Before (switch statement):**
```tsx
{items.map(item => {
  switch(item.type) {
    case 'chat':
      return <ChatItem {...item} />;
    case 'call':
      return <CallItem {...item} />;
    default:
      return <GenericItem {...item} />;
  }
})}
```

**After (registry):**
```tsx
<SecondaryList items={items} />
```

The registry handles all rendering automatically!

---

## Best Practices

### 1. Use Variant Registry for Dynamic Content

❌ **Don't**: Hardcode item types
```tsx
{item.type === 'chat' && <ChatItem />}
{item.type === 'call' && <CallItem />}
```

✅ **Do**: Use variants
```tsx
<SecondaryList items={items} />
```

### 2. Keep Params Type-Safe

✅ **Do**: Define Zod schemas
```tsx
const MyParams = z.object({
  required: z.string(),
  optional: z.number().optional(),
});
```

### 3. Register Custom Variants Early

✅ **Do**: Register in feature initialization
```tsx
// features/my-feature/config.ts
export function initializeFeature() {
  itemVariantRegistry.register(myCustomVariant);
}
```

### 4. Use Absolute Imports

✅ **Do**:
```tsx
import { SecondaryList } from "@/frontend/shared/ui/layout/sidebar/secondary";
```

### 5. Handle Loading & Empty States

✅ **Do**:
```tsx
<SecondaryList
  items={items}
  loading={isLoading}
  error={error}
  emptyText="No items yet"
/>
```

---

## API Reference

### Types

```typescript
// Item with variant
type SecondaryItem = ItemBase & {
  variantId: VariantId;
  params?: unknown;
};

// Render context
type RenderCtx<Params> = {
  item: ItemBase & { variantId: VariantId; params: Params };
  slots?: { leading?: ReactNode; trailing?: ReactNode; badge?: ReactNode };
  onAction?: (id: string, action: string, extra?: any) => void;
  utils: RenderUtils;
};

// Variant definition
type VariantDef<Params> = {
  id: VariantId;
  title?: string;
  description?: string;
  paramsSchema: z.ZodType<Params>;
  metaSchema?: z.ZodType<any>;
  render: (ctx: RenderCtx<Params>) => ReactNode;
};
```

### Registry API

```typescript
// Register a variant
itemVariantRegistry.register(myVariant);

// Get a variant
const variant = itemVariantRegistry.get(itemVariant.chat);

// Check if exists
if (itemVariantRegistry.has(myVariantId)) { ... }

// List all variants
const all = itemVariantRegistry.list();

// Unregister
itemVariantRegistry.unregister(myVariantId);
```

---

## Troubleshooting

### Issue: Variant not rendering

**Solution**: Ensure variant is registered before use
```tsx
import { registerBuiltInVariants } from "@/frontend/shared/ui/layout/sidebar/secondary";

// In app initialization
registerBuiltInVariants();
```

### Issue: Type errors with params

**Solution**: Check Zod schema matches your data
```tsx
// Params must match schema
const ChatParams = z.object({
  lastMessage: z.string(), // required
  lastAt: z.string(),      // required
});
```

### Issue: "Invalid params" error in console

**Solution**: Validate your data before passing to SecondaryList
```tsx
const validated = ChatParams.parse(myData);
```

---

## Related Documentation

- [Design System](../../../../docs/6_DESIGN_SYSTEM.md)
- [Feature Development](../../../../docs/2_DEVELOPER_GUIDE.md)
- [UI Components](../../README.md)

---

**Version:** 3.0.0 (Registry Pattern)
**Last Updated:** 2025-11-02
**Maintained by:** SuperSpace Team

For questions or contributions, see [Contributing Guide](../../../../docs/CONTRIBUTING.md)
