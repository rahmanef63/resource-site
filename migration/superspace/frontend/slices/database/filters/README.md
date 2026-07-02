# Database Filters System

Sistem filter yang scalable, customizable, dan fully integrated dengan Universal Database. Mendukung semua 21 property types secara dinamis dengan SSOT (Single Source of Truth) dan DRY principles.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Integration with Convex](#integration-with-convex)

## ✨ Features

- ✅ **Scalable**: Auto-generate filters dari property definitions
- ✅ **Customizable**: Operators per property type, custom validations
- ✅ **SSOT**: Properties → FilterFieldConfig conversion
- ✅ **DRY**: Reusable converters, shared constants, type-driven
- ✅ **21 Property Types**: Mendukung semua property types Universal Database
- ✅ **Convex Integration**: Query builder untuk database filtering
- ✅ **Client-side Filtering**: Apply filters tanpa database call
- ✅ **TypeScript**: Fully typed dengan auto-completion

## 🏗️ Architecture

```
frontend/slices/database/filters/
├── types.ts              # Type definitions & operator mappings
├── fieldConverters.ts    # Property → FilterFieldConfig converters
├── queryBuilder.ts       # Filter → Convex query builder
├── useFilters.ts         # React hooks untuk filter management
├── index.ts              # Public API exports
└── README.md             # This file
```

### Data Flow

```
Properties → FilterFieldConfig → Filters → ConvexQuery → Database
    ↓            ↓                  ↓           ↓
  (SSOT)    (UI Config)       (User Input)  (Query)
```

## 🚀 Quick Start

### 1. Basic Usage

```tsx
import { useFilters } from '@/frontend/slices/database/filters';
import { FiltersContent } from '@/components/ui/filters';

function MyDatabaseView({ properties, data }) {
  const { 
    filters, 
    filterFields, 
    addFilter, 
    removeFilter,
    applyFilters 
  } = useFilters({
    properties, // Array of Property objects
  });
  
  // Client-side filtering
  const filteredData = applyFilters(data);
  
  return (
    <div>
      <FiltersContent
        fields={filterFields}
        filters={filters}
        onAdd={addFilter}
        onRemove={removeFilter}
      />
      <DataTable data={filteredData} />
    </div>
  );
}
```

### 2. With Convex Integration

```tsx
import { useFilters } from '@/frontend/slices/database/filters';
import { useQuery } from 'convex/react';

function MyDatabaseView({ properties }) {
  const { 
    filters, 
    filterFields, 
    convexQuery,
    addFilter, 
    removeFilter 
  } = useFilters({
    properties,
    onFiltersChange: (filters, query) => {
      console.log('Convex Query:', query);
    }
  });
  
  // Use convexQuery in Convex query
  const data = useQuery(api.database.list, { 
    filter: convexQuery 
  });
  
  return (
    <FiltersContent
      fields={filterFields}
      filters={filters}
      onAdd={addFilter}
      onRemove={removeFilter}
    />
  );
}
```

### 3. Advanced: Filter Groups

```tsx
import { useFilterGroup } from '@/frontend/slices/database/filters';

function MyDatabaseView({ properties }) {
  const { 
    filterGroup, 
    filterFields, 
    convexQuery,
    updateFilterGroup 
  } = useFilterGroup({
    properties,
    initialFilterGroup: {
      operation: 'AND',
      filters: [],
      groups: []
    }
  });
  
  // filterGroup supports nested groups with AND/OR
  // { operation: 'AND', filters: [...], groups: [...] }
  
  return <Filters fields={filterFields} {...filterGroup} />;
}
```

## 📚 API Reference

### Hooks

#### `useFilters(options)`

Hook untuk simple filter management (flat list of filters).

**Options:**
```typescript
{
  properties: Property[];           // Database properties
  initialFilters?: Filter[];        // Initial filters
  initialOperation?: 'AND' | 'OR';  // Default: 'AND'
  groupByType?: boolean;            // Group fields by type
  onFiltersChange?: (filters, query) => void; // Callback
}
```

**Returns:**
```typescript
{
  filters: Filter[];                // Current filters
  operation: 'AND' | 'OR';          // Filter operation
  filterFields: FilterFieldConfig[]; // UI configurations
  convexQuery: ConvexQueryFilter;   // Convex query object
  propertyTypes: Record<string, string>; // Property types map
  addFilter: (filter) => void;      // Add filter
  updateFilter: (index, filter) => void; // Update filter
  removeFilter: (index) => void;    // Remove filter
  clearFilters: () => void;         // Clear all
  setOperation: (op) => void;       // Set AND/OR
  setFilters: (filters) => void;    // Set filters directly
  applyFilters: <T>(data: T[]) => T[]; // Client-side filtering
  hasFilters: boolean;              // Has active filters
  filterCount: number;              // Filter count
}
```

#### `useFilterGroup(options)`

Hook untuk advanced filter management dengan nested groups.

**Options:**
```typescript
{
  properties: Property[];
  initialFilterGroup?: FilterGroup;
  onFilterGroupChange?: (group, query) => void;
}
```

**Returns:**
```typescript
{
  filterGroup: FilterGroup;
  filterFields: FilterFieldConfig[];
  convexQuery: ConvexQueryFilter;
  propertyTypes: Record<string, string>;
  updateFilterGroup: (group) => void;
  clearFilterGroup: () => void;
  applyFilters: <T>(data: T[]) => T[];
}
```

### Functions

#### `propertyToFilterField(property)`

Convert single Property ke FilterFieldConfig.

```typescript
const filterField = propertyToFilterField(property);
// Returns: { key, label, type, operators, options, ... }
```

#### `propertiesToFilterFields(properties, options)`

Convert multiple Properties ke array of FilterFieldConfig.

```typescript
const filterFields = propertiesToFilterFields(properties, {
  groupByType: true,        // Group by property type
  excludeTypes: ['button'], // Exclude certain types
});
```

#### `buildConvexQuery(filters, propertyTypes, operation)`

Build Convex query object dari filters.

```typescript
const query = buildConvexQuery(filters, propertyTypes, 'AND');
// Returns: { operation: 'AND', filters: [...] }
```

#### `applyQueryFilter(data, query)`

Apply filter query ke data (client-side).

```typescript
const isMatch = applyQueryFilter(item, convexQuery);
// Returns: boolean
```

### Types

#### `Filter`

```typescript
interface Filter {
  key: string;      // Property key
  operator: string; // Filter operator
  value: any;       // Filter value
}
```

#### `FilterGroup`

```typescript
interface FilterGroup {
  operation: 'AND' | 'OR';
  filters: Filter[];
  groups?: FilterGroup[];  // Nested groups
}
```

#### `ConvexFilterExpression`

```typescript
interface ConvexFilterExpression {
  field: string;
  operator: string;
  value: any;
  propertyType: PropertyType;
}
```

#### `ConvexQueryFilter`

```typescript
interface ConvexQueryFilter {
  operation: 'AND' | 'OR';
  filters: (ConvexFilterExpression | ConvexQueryFilter)[];
}
```

## 📝 Examples

### Example 1: Text Search

```tsx
const { addFilter } = useFilters({ properties });

// Add text contains filter
addFilter({
  key: 'title',
  operator: 'contains',
  value: 'Task'
});
```

### Example 2: Number Range

```tsx
addFilter({
  key: 'priority',
  operator: 'between',
  value: [1, 5]
});
```

### Example 3: Multi-select

```tsx
addFilter({
  key: 'tags',
  operator: 'includesAnyOf',
  value: ['urgent', 'important']
});
```

### Example 4: Date Range

```tsx
addFilter({
  key: 'created_time',
  operator: 'between',
  value: [startDate, endDate]
});
```

### Example 5: Complex Query (AND + OR)

```tsx
const filterGroup = {
  operation: 'AND',
  filters: [
    { key: 'status', operator: 'is', value: 'active' }
  ],
  groups: [
    {
      operation: 'OR',
      filters: [
        { key: 'priority', operator: 'equals', value: 5 },
        { key: 'tags', operator: 'contains', value: 'urgent' }
      ]
    }
  ]
};

// Result: status = 'active' AND (priority = 5 OR tags contains 'urgent')
```

## 🔗 Integration with Convex

### Backend: Convex Query Handler

```typescript
// convex/database/queries.ts
import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    filter: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('records');
    
    if (args.filter) {
      query = applyConvexFilter(query, args.filter);
    }
    
    return await query.collect();
  },
});

function applyConvexFilter(query, filter) {
  if (!filter || !filter.filters || filter.filters.length === 0) {
    return query;
  }
  
  // Apply each filter expression
  filter.filters.forEach(expr => {
    if (expr.operation) {
      // Nested group - handle recursively
      query = applyConvexFilter(query, expr);
    } else {
      // Single expression
      query = query.filter(q => 
        applyOperator(q.field(expr.field), expr.operator, expr.value)
      );
    }
  });
  
  return query;
}

function applyOperator(field, operator, value) {
  switch (operator) {
    case 'equals': return field.eq(value);
    case 'notEquals': return field.neq(value);
    case 'greaterThan': return field.gt(value);
    case 'lessThan': return field.lt(value);
    case 'contains': return field.contains(value);
    // ... add more operators
    default: return true;
  }
}
```

### Frontend: Usage with Convex

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFilters } from '@/frontend/slices/database/filters';

function MyComponent({ properties }) {
  const [convexFilter, setConvexFilter] = useState(null);
  
  const { filters, filterFields, addFilter, removeFilter } = useFilters({
    properties,
    onFiltersChange: (filters, query) => {
      setConvexFilter(query);
    }
  });
  
  const data = useQuery(api.database.list, { 
    filter: convexFilter 
  });
  
  return (
    <div>
      <FiltersContent
        fields={filterFields}
        filters={filters}
        onAdd={addFilter}
        onRemove={removeFilter}
      />
      <DataTable data={data} />
    </div>
  );
}
```

## 🎯 Supported Property Types

All 21 Universal Database property types are supported:

### Core Types (14)
- ✅ `text` - Text contains/equals
- ✅ `title` - Title search
- ✅ `number` - Number comparison
- ✅ `select` - Single choice
- ✅ `multi_select` - Multiple choices
- ✅ `date` - Date comparison
- ✅ `checkbox` - Boolean
- ✅ `email` - Email validation
- ✅ `url` - URL validation
- ✅ `phone` - Phone validation
- ✅ `formula` - Formula result
- ✅ `rollup` - Rollup result
- ✅ `created_time` - Timestamp
- ✅ `last_edited_time` - Timestamp

### Extended Types (7)
- ✅ `created_by` - User selection
- ✅ `last_edited_by` - User selection
- ✅ `files` - File attachment
- ✅ `relation` - Related records
- ✅ `status` - Status with groups
- ✅ `people` - Multiple users
- ✅ `button` - (No filters)
- ✅ `unique_id` - ID search
- ✅ `place` - Location search

## 🔧 Constants

### `PROPERTY_TYPE_OPERATORS`

Maps each PropertyType to available filter operators:

```typescript
PROPERTY_TYPE_OPERATORS = {
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'startsWith', label: 'starts with' },
    // ...
  ],
  number: [
    { value: 'equals', label: 'equals' },
    { value: 'greaterThan', label: 'greater than' },
    // ...
  ],
  // ... untuk semua 21 types
}
```

### `PROPERTY_TYPE_TO_FILTER_TYPE`

Maps PropertyType ke filter UI type:

```typescript
PROPERTY_TYPE_TO_FILTER_TYPE = {
  text: 'text',
  number: 'number',
  select: 'select',
  multi_select: 'multiselect',
  date: 'date',
  // ...
}
```

### `DEFAULT_OPERATORS`

Default operator untuk setiap PropertyType:

```typescript
DEFAULT_OPERATORS = {
  text: 'contains',
  number: 'equals',
  select: 'is',
  // ...
}
```

## 🧪 Testing

```tsx
import { 
  propertyToFilterField, 
  buildConvexQuery,
  applyQueryFilter 
} from '@/frontend/slices/database/filters';

// Test property conversion
const property = { key: 'title', name: 'Title', type: 'text' };
const filterField = propertyToFilterField(property);
expect(filterField.key).toBe('title');
expect(filterField.type).toBe('text');

// Test query building
const filters = [
  { key: 'title', operator: 'contains', value: 'Task' }
];
const query = buildConvexQuery(filters, { title: 'text' });
expect(query.operation).toBe('AND');
expect(query.filters.length).toBe(1);

// Test client-side filtering
const data = [
  { title: 'Task 1' },
  { title: 'Note 1' }
];
const filtered = data.filter(item => applyQueryFilter(item, query));
expect(filtered.length).toBe(1);
expect(filtered[0].title).toBe('Task 1');
```

## 📖 Related Documentation

- [Universal Database Types](../../shared/foundation/types/universal-database.ts)
- [Filters UI Component](../../../components/ui/filters.tsx)
- [Convex Schema](../../../convex/schema.ts)

## 🎨 Design Principles

1. **SSOT (Single Source of Truth)**
   - Properties adalah source of truth
   - Filter configurations auto-generated dari properties
   - Tidak ada hardcoded filter definitions

2. **DRY (Don't Repeat Yourself)**
   - Reusable converters dan utilities
   - Shared constants untuk operators dan types
   - Type-driven dengan TypeScript

3. **Scalability**
   - Support untuk 21+ property types
   - Extensible operator system
   - Dynamic filter field generation

4. **Customizability**
   - Per-property operator customization
   - Custom validation functions
   - Flexible UI configurations

5. **Type Safety**
   - Full TypeScript coverage
   - Runtime type validation
   - Auto-completion support

## 🔮 Future Enhancements

- [ ] Filter templates/presets
- [ ] Saved filters persistence
- [ ] Filter history
- [ ] Advanced date operators (this week, last month, etc.)
- [ ] Fuzzy search for text
- [ ] Regular expression support
- [ ] Filter performance analytics
- [ ] Filter sharing/export

## 🤝 Contributing

When adding new property types:

1. Add operators to `PROPERTY_TYPE_OPERATORS`
2. Add UI type mapping to `PROPERTY_TYPE_TO_FILTER_TYPE`
3. Add default operator to `DEFAULT_OPERATORS`
4. Add conversion logic to `propertyToFilterField()`
5. Add query operator to `convertOperator()`
6. Update this README

---

Built with ❤️ for Universal Database
