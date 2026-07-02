# Constants Directory

> **UI & View Layer Constants**

This directory contains **presentation layer** constants for the database feature - specifically view types, colors, and UI-related configurations.

---

## 📁 Files

### `index.ts`
**Purpose:** View type mappings, UI colors, and layout constants

**Exports:**

#### View Type Mappings (SOURCE OF TRUTH)
- `DATABASE_VIEW_ORDER` - Order of views in UI
- `DB_VIEW_TYPE_TO_APP` - Maps database view types to app view types
- `APP_VIEW_TYPE_TO_DB` - Maps app view types to database view types

**Usage:**
```typescript
import { APP_VIEW_TYPE_TO_DB, DB_VIEW_TYPE_TO_APP } from '../constants';

// Convert app view to database view
const dbViewType = APP_VIEW_TYPE_TO_DB['gantt']; // 'timeline'

// Convert database view to app view  
const appViewType = DB_VIEW_TYPE_TO_APP['board']; // 'kanban'
```

#### UI Color Constants
- `STATUS_COLOR_FALLBACKS` - Default status badge colors
- `DEFAULT_MARKER_CLASSES` - Default colors for markers/tags

**Usage:**
```typescript
import { STATUS_COLOR_FALLBACKS } from '../constants';

const statusColor = STATUS_COLOR_FALLBACKS[0]; // 'bg-blue-100 text-blue-900'
```

---

## 🎯 When to Add Here

Use this directory for:
- ✅ **View configurations** - View type mappings, view layouts
- ✅ **UI constants** - Colors, CSS classes, theme values
- ✅ **Presentation logic** - Display orders, visibility rules
- ✅ **Layout constants** - Grid sizes, spacing values

Do NOT use for:
- ❌ **Data model definitions** → use `config/`
- ❌ **Business logic constants** → use `config/`
- ❌ **API schemas** → use `types/`
- ❌ **Component state** → use component files

---

## 🔗 Related Directories

| Directory | Purpose | Relationship |
|-----------|---------|--------------|
| `config/` | Data model & business logic | Sibling - domain layer |
| `utils/` | Helper functions | Imports constants for logic |
| `components/` | UI components | Imports constants for rendering |
| `views/` | View components | Imports view type mappings |

---

## 📝 Best Practices

1. **SSOT (Single Source of Truth)** - Never duplicate constants
2. **Immutability** - Use `as const satisfies Type` for type safety
3. **Naming Conventions**:
   - SCREAMING_SNAKE_CASE for constants
   - Descriptive names that indicate purpose
4. **Documentation** - Add JSDoc comments explaining usage
5. **Type Safety** - Use `satisfies` to ensure type correctness

---

## 🔄 View Type Mappings

The view type mappings bridge the gap between:
- **Database Layer** (`board`, `timeline`, `gallery`, etc.) - How views are stored
- **App Layer** (`kanban`, `gantt`, `table`, etc.) - How views are displayed

### Current Mappings

| Database Type | App Type | Description |
|--------------|----------|-------------|
| `table` | `table` | Table/spreadsheet view |
| `board` | `kanban` | Kanban board view |
| `calendar` | `calendar` | Calendar view |
| `list` | `list` | List view |
| `timeline` | `gantt` | Gantt/timeline view |
| `gallery` | `table` | Gallery view (fallback to table) |

### Usage Pattern

```typescript
// In components - converting database view to app view
import { DB_VIEW_TYPE_TO_APP } from '../constants';

function renderView(dbView: DatabaseView) {
  const appViewType = DB_VIEW_TYPE_TO_APP[dbView.type];
  // Now use appViewType to render correct component
}

// In mutations - converting app view to database view
import { APP_VIEW_TYPE_TO_DB } from '../constants';

function createView(appViewType: string) {
  const dbViewType = APP_VIEW_TYPE_TO_DB[appViewType];
  // Store dbViewType in database
}
```

---

## 🎨 Color Constants

### Status Color Fallbacks

Default colors for status badges when no custom color is set:

```typescript
const STATUS_COLOR_FALLBACKS = [
  "bg-blue-100 text-blue-900",
  "bg-green-100 text-green-900",
  "bg-purple-100 text-purple-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
  "bg-sky-100 text-sky-900",
  "bg-teal-100 text-teal-900",
];
```

**Usage:**
```typescript
// Get color by index (cycles through array)
const color = STATUS_COLOR_FALLBACKS[statusIndex % STATUS_COLOR_FALLBACKS.length];
```

### Default Marker Classes

Colors for markers, tags, or highlights:

```typescript
const DEFAULT_MARKER_CLASSES = [
  "bg-blue-100 text-blue-900",
  "bg-emerald-100 text-emerald-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-900",
];
```

---

## 🚀 Adding New Constants

### Adding a View Type

1. Add to type mappings:
```typescript
export const APP_VIEW_TYPE_TO_DB = {
  // ...existing...
  my_new_view: "my_db_view",
} as const satisfies Record<DatabaseViewType, DatabaseView["type"]>;

export const DB_VIEW_TYPE_TO_APP = {
  // ...existing...
  my_db_view: "my_new_view",
} as const satisfies Record<DatabaseView["type"], DatabaseViewType>;
```

2. Add to view order:
```typescript
export const DATABASE_VIEW_ORDER = [
  // ...existing...
  "my_new_view",
] as const satisfies ReadonlyArray<string>;
```

### Adding UI Colors

```typescript
export const MY_COLOR_SET = [
  "bg-color1-100 text-color1-900",
  "bg-color2-100 text-color2-900",
  // ...
] as const;
```

---

## ⚠️ Important Notes

### Why Separate from config/?

| Concern | config/ | constants/ |
|---------|---------|------------|
| **Layer** | Domain/Business Logic | Presentation/UI |
| **Changes** | Require business analysis | Design decisions |
| **Testing** | Business logic tests | Visual/UI tests |
| **Consumers** | Backend, converters, logic | Components, renderers |

### DRY Principle

**NEVER DUPLICATE THESE CONSTANTS!**

❌ **Wrong:**
```typescript
// In some other file
const viewMapping = { table: 'table', board: 'kanban' }; // NO!
```

✅ **Correct:**
```typescript
// Always import from constants
import { APP_VIEW_TYPE_TO_DB } from '../constants';
```

---

**Last Updated:** November 9, 2025
