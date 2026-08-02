# Shared Components & Hooks

This directory contains **reusable components and hooks** that are used across multiple features in the application.

## 📁 Structure

```
frontend/shared/
├── components/
│   ├── layouts/          # Layout patterns
│   │   └── MasterDetailLayout.tsx
│   └── ui/               # UI components
│       ├── EmptyState.tsx
│       └── FeatureListHeader.tsx
└── hooks/                # Reusable hooks
    ├── useFeatureNavigation.ts
    ├── useMobileResponsive.ts
    └── useSearchFilter.ts
```

---

## 🎨 Components

### 1. MasterDetailLayout

**Purpose:** Generic layout for list/detail split views (WhatsApp-style)

**Behavior:**
- **Desktop:** Shows list and detail side-by-side
- **Mobile:** Shows either list OR detail (not both)

**Usage:**
```tsx
import { MasterDetailLayout } from '@/frontend/shared/components/layouts'

<MasterDetailLayout
  listView={<CallListView />}
  detailView={<CallDetailView />}
  hasSelection={!!selectedCallId}
/>
```

**Props:**
- `listView`: React component for the list/sidebar
- `detailView`: React component for the detail view
- `hasSelection`: Boolean indicating if an item is selected
- `className`: Optional CSS classes
- `listWidth`: Custom width for list (default: `lg:w-[320px]`)

---

### 2. EmptyState

**Purpose:** Reusable "no data" state component

**Usage:**
```tsx
import { EmptyState } from '@/components/ui'
import { Phone } from 'lucide-react'

<EmptyState
  icon={Phone}
  title="No recent calls"
  description="Your call history will appear here"
/>
```

**Props:**
- `icon`: Lucide icon component
- `title`: Main heading text
- `description`: Optional description text
- `action`: Optional action button/element
- `className`: Optional CSS classes
- `iconSize`: Icon size (default: `h-16 w-16`)
- `iconColor`: Icon color (default: `text-muted-foreground`)

---

### 3. FeatureListHeader

**Purpose:** Reusable header for list views with title, search, and add button

**Usage:**
```tsx
import { FeatureListHeader } from '@/components/ui'

<FeatureListHeader
  title="AI Chats"
  onAddClick={() => createNewChat()}
  searchPlaceholder="Search AI chats..."
  searchValue={query}
  onSearchChange={setQuery}
/>
```

**Props:**
- `title`: Header title
- `onAddClick`: Callback when add button is clicked
- `searchPlaceholder`: Search input placeholder
- `searchValue`: Current search value
- `onSearchChange`: Search value change handler
- `showAddButton`: Show/hide add button (default: `true`)
- `addButtonIcon`: Custom add button icon
- `searchComponent`: Custom search component
- `className`: Optional CSS classes

---

## 🪝 Hooks

### 1. useFeatureNavigation

**Purpose:** Consolidated navigation logic for list/detail features

**Usage:**
```tsx
import { useFeatureNavigation } from '@/frontend/shared/foundation'

const { selectedId, setSelectedId, handleBack, hasSelection } = useFeatureNavigation()

// Use in components:
<Button onClick={handleBack}>Back</Button>
<CallList onSelect={setSelectedId} />
{hasSelection && <CallDetail />}
```

**Returns:**
- `selectedId`: Currently selected item ID
- `setSelectedId`: Function to update selection
- `handleBack`: Function to handle back navigation
- `clearSelection`: Function to clear selection
- `hasSelection`: Boolean indicating if something is selected

---

### 2. useMobileResponsive

**Purpose:** Determine which views to show based on device type

**Usage:**
```tsx
import { useMobileResponsive } from '@/frontend/shared/foundation'

const { isMobile, showList, showDetail, layoutMode } = useMobileResponsive(!!selectedId)

if (showList) return <ListView />
if (showDetail) return <DetailView />
```

**Returns:**
- `isMobile`: Boolean for mobile device
- `showList`: Whether to show list view
- `showDetail`: Whether to show detail view
- `layoutMode`: `'stack'` or `'split'`
- `shouldShowList`: Mobile-specific list visibility
- `shouldShowDetail`: Mobile-specific detail visibility

---

### 3. useSearchFilter

**Purpose:** Generic search filtering for any list of items

**Usage:**
```tsx
import { useSearchFilter } from '@/frontend/shared/foundation'

const calls = [{ name: 'Alice' }, { name: 'Bob' }]
const { query, setQuery, filteredItems, resultCount } = useSearchFilter(
  calls,
  'name' // or ['name', 'email'] for multiple keys
)

<input value={query} onChange={e => setQuery(e.target.value)} />
{filteredItems.map(call => <div>{call.name}</div>)}
```

**Parameters:**
- `items`: Array of items to filter
- `searchKeys`: Key(s) to search (string or array)
- `caseSensitive`: Case-sensitive search (default: `false`)

**Returns:**
- `query`: Current search query
- `setQuery`: Update search query
- `filteredItems`: Filtered results
- `clearSearch`: Clear the search
- `isSearching`: Boolean if search is active
- `resultCount`: Number of filtered results

---

##  Design Principles

1. **DRY (Don't Repeat Yourself)**
   - Each component/hook solves ONE common pattern
   - Features import from shared instead of duplicating code

2. **Composability**
   - Components accept render props for flexibility
   - Hooks can be combined for complex behaviors

3. **Type Safety**
   - All components and hooks are fully typed with TypeScript
   - Generics where appropriate for reusability

4. **Mobile-First**
   - All components handle responsive behavior
   - Hooks provide mobile/desktop detection

5. **Accessibility**
   - Semantic HTML
   - Keyboard navigation support
   - ARIA labels where needed

---

## 📝 Adding New Shared Components

When adding a new shared component:

1. **Check if it's truly reusable** across 3+ features
2. **Create the component** in appropriate directory:
   - Layout patterns → `components/layouts/`
   - UI components → `components/ui/`
   - Hooks → `hooks/`
3. **Add JSDoc comments** with examples
4. **Export from index.ts**
5. **Update this README**
6. **Write tests** (if applicable)

---

## 🔍 Examples

### Full Feature Example (Calls)

```tsx
import { MasterDetailLayout } from '@/frontend/shared/components/layouts'
import { EmptyState, FeatureListHeader } from '@/components/ui'
import { useFeatureNavigation, useSearchFilter } from '@/frontend/shared/foundation'
import { Phone } from 'lucide-react'

function CallsFeature() {
  const { selectedId, setSelectedId, hasSelection } = useFeatureNavigation()
  const { query, setQuery, filteredItems } = useSearchFilter(calls, 'name')

  const listView = (
    <>
      <FeatureListHeader
        title="Calls"
        searchValue={query}
        onSearchChange={setQuery}
        showAddButton={false}
      />
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No calls yet"
          description="Start a call to see it here"
        />
      ) : (
        <CallList items={filteredItems} onSelect={setSelectedId} />
      )}
    </>
  )

  const detailView = selectedId ? (
    <CallDetail callId={selectedId} />
  ) : (
    <EmptyState icon={Phone} title="Select a call" />
  )

  return (
    <MasterDetailLayout
      listView={listView}
      detailView={detailView}
      hasSelection={hasSelection}
    />
  )
}
```

---

## 📚 Related Documentation

- [System Overview](../../../docs/1_SYSTEM_OVERVIEW.md)
- [Developer Guide](../../../docs/2_DEVELOPER_GUIDE.md)
- [Feature Package System](../../../docs/1_SYSTEM_OVERVIEW.md#feature-package-system)

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
