# Secondary Sidebar Layout System

A modular, reusable layout system for building secondary sidebars with headers, toolbars, search, sort, filter, and content areas.

## 📁 Structure

```
frontend/shared/layout/secondary-sidebar/
├── components/
│   ├── SecondarySidebarLayout.tsx    # Main layout container
│   ├── SecondarySidebarHeader.tsx    # Header with title, actions, breadcrumbs
│   ├── SecondarySidebar.tsx          # Sidebar with sections and items
│   └── SecondarySidebarTools.tsx     # Search, sort, filter, view toggle
├── index.ts                          # Barrel export
└── README.md                         # This file
```

##  Components

### 1. SecondarySidebarLayout

Main container that orchestrates header, sidebar, and content areas.

```tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/secondary-sidebar";

<SecondarySidebarLayout
  headerProps={{
    title: "My Feature",
    description: "Feature description",
    primaryAction: {
      label: "Create",
      icon: Plus,
      onClick: () => console.log("create"),
    },
  }}
  sidebarProps={{
    sections: [
      {
        title: "Section 1",
        items: [
          { id: "1", label: "Item 1", onClick: () => {} },
        ],
      },
    ],
  }}
>
  <div>Main content here</div>
</SecondarySidebarLayout>
```

**Props:**
- `header?: ReactNode` - Custom header component
- `sidebar?: ReactNode` - Custom sidebar component
- `headerProps?: SecondarySidebarHeaderProps` - Props for auto-generated header
- `sidebarProps?: SecondarySidebarProps` - Props for auto-generated sidebar
- `children: ReactNode` - Main content area

### 2. SecondarySidebarHeader

Header component with title, actions, breadcrumbs, and toolbar.

```tsx
import { SecondarySidebarHeader } from "@/frontend/shared/layout/secondary-sidebar";

<SecondarySidebarHeader
  title="Menu Store"
  description="Manage workspace menus"
  primaryAction={{
    label: "Add Menu",
    icon: Plus,
    onClick: handleCreate,
  }}
  secondaryActions={
    <Button variant="ghost" size="sm">
      <RefreshCw className="h-4 w-4" />
      Sync
    </Button>
  }
  breadcrumbs={<BreadcrumbNavigation />}
  toolbar={<SecondarySidebarTools />}
/>
```

**Props:**
- `title: string` - Header title (required)
- `description?: ReactNode` - Subtitle/description
- `meta?: ReactNode` - Additional metadata
- `breadcrumbs?: ReactNode` - Breadcrumb navigation
- `toolbar?: ReactNode` - Toolbar area (search, filters, etc.)
- `primaryAction?: SecondaryHeaderAction | ReactNode` - Primary CTA button
- `secondaryActions?: ReactNode` - Additional action buttons
- `children?: ReactNode` - Custom header content

### 3. SecondarySidebarTools

Toolbar with search, sort, filter, and view toggle controls.

```tsx
import { SecondarySidebarTools } from "@/frontend/shared/layout/secondary-sidebar";

<SecondarySidebarTools
  search={{
    value: searchQuery,
    onChange: setSearchQuery,
    placeholder: "Search items...",
  }}
  sortOptions={[
    { label: "Name", value: "name" },
    { label: "Date", value: "date" },
  ]}
  currentSort="name"
  onSortChange={setSort}
  filterOptions={[
    { label: "Active", value: "active", active: true, count: 5 },
    { label: "Archived", value: "archived", active: false, count: 2 },
  ]}
  onFilterToggle={toggleFilter}
  viewOptions={[
    { label: "Grid", value: "grid", icon: LayoutGrid },
    { label: "List", value: "list", icon: LayoutList },
  ]}
  currentView="grid"
  onViewChange={setView}
/>
```

**Props:**
- `search?: SecondaryHeaderSearchProps` - Search input config
- `sortOptions?: SortOption[]` - Sort options dropdown
- `currentSort?: string` - Active sort option
- `onSortChange?: (value: string) => void` - Sort change handler
- `filterOptions?: FilterOption[]` - Filter options dropdown
- `onFilterToggle?: (value: string) => void` - Filter toggle handler
- `viewOptions?: ViewOption[]` - View toggle buttons
- `currentView?: string` - Active view
- `onViewChange?: (value: string) => void` - View change handler
- `customTools?: ReactNode` - Additional custom tools

### 4. SecondarySidebar

Sidebar with sections, items, and navigation.

```tsx
import { SecondarySidebar } from "@/frontend/shared/layout/secondary-sidebar";

<SecondarySidebar
  sections={[
    {
      id: "section-1",
      title: "Navigation",
      items: [
        {
          id: "1",
          label: "Dashboard",
          icon: Home,
          href: "/dashboard",
          active: true,
        },
        {
          id: "2",
          label: "Settings",
          icon: Settings,
          onClick: () => console.log("settings"),
        },
      ],
    },
    {
      id: "section-2",
      title: "Custom Content",
      content: <CustomComponent />,
    },
  ]}
  variant="panel"
/>
```

**Props:**
- `sections?: SecondarySidebarSectionProps[]` - Sidebar sections
- `header?: ReactNode` - Sidebar header
- `footer?: ReactNode` - Sidebar footer
- `variant?: "panel" | "minimal"` - Visual variant
- `className?: string` - Additional CSS classes

## 🎨 Usage Examples

### Example 1: Simple Feature Page

```tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/secondary-sidebar";

export default function MyFeaturePage() {
  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "My Feature",
        primaryAction: {
          label: "Create",
          icon: Plus,
          onClick: () => console.log("create"),
        },
      }}
    >
      <div className="p-6">
        <p>Main content here</p>
      </div>
    </SecondarySidebarLayout>
  );
}
```

### Example 2: With Sidebar Navigation

```tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/secondary-sidebar";

export default function MyFeaturePage() {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "Documents",
      }}
      sidebarProps={{
        sections: [
          {
            title: "Recent",
            items: [
              {
                id: "doc-1",
                label: "Project Plan",
                icon: FileText,
                active: selectedId === "doc-1",
                onClick: () => setSelectedId("doc-1"),
              },
            ],
          },
        ],
      }}
    >
      <div className="p-6">
        <p>Document content for {selectedId}</p>
      </div>
    </SecondarySidebarLayout>
  );
}
```

### Example 3: With Search, Sort, Filter

```tsx
import {
  SecondarySidebarLayout,
  SecondarySidebarTools,
} from "@/frontend/shared/layout/secondary-sidebar";

export default function MyFeaturePage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [view, setView] = useState("grid");

  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "Projects",
        toolbar: (
          <SecondarySidebarTools
            search={{
              value: search,
              onChange: setSearch,
              placeholder: "Search projects...",
            }}
            sortOptions={[
              { label: "Name", value: "name" },
              { label: "Date", value: "date" },
            ]}
            currentSort={sort}
            onSortChange={setSort}
            filterOptions={[
              {
                label: "Active",
                value: "active",
                active: filters.has("active"),
              },
            ]}
            onFilterToggle={(value) => {
              const newFilters = new Set(filters);
              if (newFilters.has(value)) {
                newFilters.delete(value);
              } else {
                newFilters.add(value);
              }
              setFilters(newFilters);
            }}
            viewOptions={[
              { label: "Grid", value: "grid", icon: LayoutGrid },
              { label: "List", value: "list", icon: LayoutList },
            ]}
            currentView={view}
            onViewChange={setView}
          />
        ),
      }}
    >
      <div className="p-6">
        {view === "grid" ? <GridView /> : <ListView />}
      </div>
    </SecondarySidebarLayout>
  );
}
```

### Example 4: Advanced with Preview Panel

```tsx
import { SecondarySidebarLayout } from "@/frontend/shared/layout/secondary-sidebar";

export default function MenuStorePage() {
  const [selectedId, setSelectedId] = useState<Id<"menuItems">>();

  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "Menu Store",
        toolbar: <SecondarySidebarTools />,
      }}
      sidebarProps={{
        sections: [{ title: "Structure", content: <MenuTree /> }],
      }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <MenuGrid onSelect={setSelectedId} />
        </div>

        {/* Preview Panel */}
        <aside className="w-96 shrink-0 border-l">
          <MenuPreview menuItemId={selectedId} />
        </aside>
      </div>
    </SecondarySidebarLayout>
  );
}
```

## 🔧 Customization

### Custom Header

```tsx
<SecondarySidebarLayout
  header={
    <div className="border-b bg-background p-6">
      <h1>Custom Header</h1>
      <CustomHeaderContent />
    </div>
  }
>
  {children}
</SecondarySidebarLayout>
```

### Custom Sidebar

```tsx
<SecondarySidebarLayout
  sidebar={
    <aside className="w-80 border-r">
      <CustomSidebarContent />
    </aside>
  }
>
  {children}
</SecondarySidebarLayout>
```

##  Best Practices

1. **Use headerProps/sidebarProps** when possible - easier than custom components
2. **Consistent spacing** - Use p-6 for main content padding
3. **Responsive design** - Layout adapts to mobile automatically
4. **Type safety** - Always use provided TypeScript types
5. **Accessibility** - Components include ARIA attributes

## 📚 Type Definitions

```typescript
interface SecondarySidebarLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  headerProps?: SecondarySidebarHeaderProps;
  sidebarProps?: SecondarySidebarProps;
}

interface SecondarySidebarHeaderProps {
  title: string;
  description?: ReactNode;
  primaryAction?: SecondaryHeaderAction | ReactNode;
  secondaryActions?: ReactNode;
  breadcrumbs?: ReactNode;
  toolbar?: ReactNode;
}

interface SecondaryHeaderAction {
  label: string;
  icon?: React.ElementType;
  onClick?: () => void;
  buttonProps?: VariantProps<typeof buttonVariants>;
  disabled?: boolean;
}

interface SortOption {
  label: string;
  value: string;
  icon?: React.ElementType;
}

interface FilterOption {
  label: string;
  value: string;
  active?: boolean;
  icon?: React.ElementType;
  count?: number;
}

interface ViewOption {
  label: string;
  value: string;
  icon?: React.ElementType;
}
```

## 🔗 Related

- [Menu Components](../menus/README.md)
- [Chat Layout](../chat/README.md)
- [Feature Examples](../../slices/README.md)

---

**Version:** 1.0.0
**Last Updated:** 2025-01-19
