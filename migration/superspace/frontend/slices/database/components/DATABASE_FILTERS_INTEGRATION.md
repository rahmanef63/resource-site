# Database Filters Integration

## Overview

Filter system telah berhasil diintegrasikan ke dalam Database Toolbar. Sekarang setiap database view dapat memiliki filter yang dinamis berdasarkan properties-nya.

## Components Created

### 1. `DatabaseFilters.tsx`

Component yang mengintegrasikan filter system dengan UI database toolbar.

**Features:**
- ✅ Popover UI untuk menambah/manage filters
- ✅ Badge counter menampilkan jumlah active filters
- ✅ Auto-generate filter fields dari properties
- ✅ Real-time Convex query generation
- ✅ Clear all filters functionality
- ✅ Empty state UI

**Props:**
```typescript
interface DatabaseFiltersProps {
  properties: Property[];           // Database properties
  onFiltersChange?: (query: ConvexQueryFilter) => void;  // Callback
  size?: "sm" | "default" | "lg" | "icon";  // Button size
  variant?: "ghost" | "outline" | "default";  // Button variant
}
```

### 2. `DatabaseToolbar.tsx` (Updated)

Updated dengan filter integration.

**New Props:**
```typescript
properties?: Property[];  // Database properties untuk filters
onFiltersChange?: (query: ConvexQueryFilter) => void;  // Filter callback
```

## Usage

### Basic Usage

```typescript
import { DatabaseToolbar } from '@/frontend/slices/database/components';

function MyDatabaseView() {
  const [filterQuery, setFilterQuery] = useState<ConvexQueryFilter | null>(null);
  
  return (
    <DatabaseToolbar
      activeView="table"
      onViewChange={handleViewChange}
      views={views}
      defaultViewType="table"
      properties={databaseProperties}  // Pass properties
      onFiltersChange={(query) => {
        setFilterQuery(query);
        // Use query in Convex call
      }}
      // ... other props
    />
  );
}
```

### With Convex Integration

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyDatabaseView({ workspaceId, databaseId }) {
  const [filterQuery, setFilterQuery] = useState<ConvexQueryFilter | null>(null);
  
  // Fetch database untuk get properties
  const database = useQuery(api.database.get, { 
    workspaceId, 
    databaseId 
  });
  
  // Fetch records dengan filter
  const records = useQuery(api.database.listRecords, {
    workspaceId,
    databaseId,
    filter: filterQuery,  // Pass filter query
  });
  
  return (
    <div>
      <DatabaseToolbar
        properties={database?.properties || []}
        onFiltersChange={setFilterQuery}
        // ... other props
      />
      
      {/* Render records */}
      <div>
        {records?.map(record => (
          <div key={record._id}>{/* ... */}</div>
        ))}
      </div>
    </div>
  );
}
```

### Standalone DatabaseFilters

You can also use DatabaseFilters independently:

```typescript
import { DatabaseFilters } from '@/frontend/slices/database/components';

function MyComponent() {
  return (
    <DatabaseFilters
      properties={properties}
      onFiltersChange={(query) => {
        console.log('Filter query:', query);
      }}
      size="sm"
      variant="outline"
    />
  );
}
```

## Filter Query Structure

The `ConvexQueryFilter` has the following structure:

```typescript
interface ConvexQueryFilter {
  operation: 'AND' | 'OR';
  filters: ConvexFilterExpression[];
}

interface ConvexFilterExpression {
  field: string;        // Property key
  operator: string;     // Filter operator (contains, equals, etc.)
  value: any;          // Filter value
  propertyType: PropertyType;  // Property type
}
```

## Backend Integration

To use filters in your Convex backend:

```typescript
// convex/database/queries.ts
import { query } from './_generated/server';

export const listRecords = query({
  args: {
    workspaceId: v.string(),
    databaseId: v.string(),
    filter: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('records')
      .filter(q => 
        q.and(
          q.eq(q.field('workspaceId'), args.workspaceId),
          q.eq(q.field('databaseId'), args.databaseId)
        )
      );
    
    // Apply filters if provided
    if (args.filter && args.filter.filters.length > 0) {
      query = applyFilters(query, args.filter);
    }
    
    return await query.collect();
  },
});

function applyFilters(query: any, filterQuery: any) {
  // Convert FilterQuery to Convex query expressions
  filterQuery.filters.forEach((filter: any) => {
    const { field, operator, value } = filter;
    
    query = query.filter(q => {
      switch (operator) {
        case 'contains':
          return q.field(field).contains(value);
        case 'equals':
          return q.eq(q.field(field), value);
        case 'greaterThan':
          return q.gt(q.field(field), value);
        case 'lessThan':
          return q.lt(q.field(field), value);
        // Add more operators as needed
        default:
          return true;
      }
    });
  });
  
  return query;
}
```

## Supported Operators

All 21 property types are supported with appropriate operators:

### Text Types (text, title, email, url, phone, unique_id, place)
- `contains`
- `notContains`
- `startsWith`
- `endsWith`
- `equals`
- `notEquals`
- `empty`
- `notEmpty`

### Number Type
- `equals`
- `notEquals`
- `greaterThan`
- `greaterThanOrEquals`
- `lessThan`
- `lessThanOrEquals`
- `between`

### Select/Multi-Select/Status
- `is`
- `isNot`
- `isAnyOf`
- `isNotAnyOf`
- `includesAnyOf`
- `includesAllOf`
- `excludes`
- `empty`
- `notEmpty`

### Date Types
- `is`
- `before`
- `after`
- `between`
- `onOrBefore`
- `onOrAfter`

### Boolean (checkbox)
- `checked`
- `unchecked`

## Example Filter Scenarios

### 1. Text Search
```typescript
// User types in filter: "title contains Task"
// Generated query:
{
  operation: 'AND',
  filters: [{
    field: 'title',
    operator: 'contains',
    value: 'Task',
    propertyType: 'text'
  }]
}
```

### 2. Number Range
```typescript
// User filters: "priority between 1 and 5"
{
  operation: 'AND',
  filters: [{
    field: 'priority',
    operator: 'between',
    value: [1, 5],
    propertyType: 'number'
  }]
}
```

### 3. Multiple Filters (AND)
```typescript
// User filters:
// - "status is active"
// - "priority > 3"
{
  operation: 'AND',
  filters: [
    {
      field: 'status',
      operator: 'equals',
      value: 'active',
      propertyType: 'select'
    },
    {
      field: 'priority',
      operator: 'greaterThan',
      value: 3,
      propertyType: 'number'
    }
  ]
}
```

## UI Features

### Badge Counter
Shows active filter count on the Filter button:
```tsx
<Button>
  Filter
  {hasFilters && <Badge>{filterCount}</Badge>}
</Button>
```

### Empty State
Displays helpful message when no filters are applied:
```tsx
{!hasFilters && (
  <div>
    <FilterIcon />
    <p>No filters applied</p>
    <p>Click "Add filter" to start filtering</p>
  </div>
)}
```

### Clear All
Quick action to remove all filters:
```tsx
<Button onClick={clearAllFilters}>
  Clear all
</Button>
```

## Testing

### Unit Tests
```typescript
describe('DatabaseFilters', () => {
  it('should generate correct filter query', () => {
    const { result } = renderHook(() => useFilters({
      properties: mockProperties
    }));
    
    // Add filter
    act(() => {
      result.current.addFilter({
        key: 'title',
        operator: 'contains',
        value: 'Test'
      });
    });
    
    expect(result.current.convexQuery).toEqual({
      operation: 'AND',
      filters: [{
        field: 'title',
        operator: 'contains',
        value: 'Test',
        propertyType: 'text'
      }]
    });
  });
});
```

### Integration Tests
```typescript
describe('DatabaseToolbar with Filters', () => {
  it('should pass filter query to parent', async () => {
    const onFiltersChange = jest.fn();
    
    render(
      <DatabaseToolbar
        properties={mockProperties}
        onFiltersChange={onFiltersChange}
        {...otherProps}
      />
    );
    
    // Open filter popover
    await user.click(screen.getByText('Filter'));
    
    // Add filter
    await user.click(screen.getByText('Add filter'));
    await user.selectOptions(screen.getByLabelText('Field'), 'title');
    await user.type(screen.getByLabelText('Value'), 'Test');
    
    expect(onFiltersChange).toHaveBeenCalledWith({
      operation: 'AND',
      filters: expect.arrayContaining([
        expect.objectContaining({
          field: 'title',
          value: 'Test'
        })
      ])
    });
  });
});
```

## Troubleshooting

### Filter Not Applying
1. Check if `properties` prop is passed to DatabaseToolbar
2. Verify `onFiltersChange` callback is implemented
3. Check if filter query is passed to Convex backend
4. Verify backend filter application logic

### UI Not Updating
1. Ensure state is properly managed
2. Check if `onChange` callback is triggering
3. Verify FiltersContent component receives updated props

### TypeScript Errors
1. Import types from correct locations
2. Ensure Property interface matches expectations
3. Check ConvexQueryFilter type definition

## Next Steps

- [ ] Add filter presets/templates
- [ ] Implement saved filters (persist to database)
- [ ] Add filter sharing functionality
- [ ] Implement advanced filter groups (nested AND/OR)
- [ ] Add filter analytics/tracking

## Related Documentation

- [Filter System README](../filters/README.md)
- [Filter Examples](../filters/EXAMPLES.md)
- [Universal Database Types](../../shared/foundation/types/universal-database.ts)

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: 2024
