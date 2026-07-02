# Database Filters - Code Examples

This file contains practical code examples for using the filter system. These are working TypeScript examples that you can copy and adapt for your features.

## Example 1: Basic Client-Side Filtering

```typescript
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import { useFilters } from '@/frontend/slices/database/filters';

interface Example1Props {
  properties: Property[];
  data: Record<string, any>[];
}

function Example1_BasicFilters({ properties, data }: Example1Props) {
  const { 
    filters, 
    filterFields, 
    addFilter, 
    removeFilter,
    applyFilters 
  } = useFilters({
    properties,
  });
  
  // Client-side filtering
  const filteredData = applyFilters(data);
  
  return (
    <div>
      <h2>Basic Filters</h2>
      <div>Total: {data.length} items</div>
      <div>Filtered: {filteredData.length} items</div>
      <div>Active Filters: {filters.length}</div>
    </div>
  );
}
```

## Example 2: Filters with Convex Integration

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFilters } from '@/frontend/slices/database/filters';

interface Example2Props {
  properties: Property[];
  workspaceId: string;
  databaseId: string;
}

function Example2_ConvexFilters({ properties, workspaceId, databaseId }: Example2Props) {
  const { 
    filters, 
    filterFields, 
    convexQuery,
    addFilter, 
    removeFilter 
  } = useFilters({
    properties,
    onFiltersChange: (filters, query) => {
      console.log('Filters changed:', { filters, query });
    }
  });
  
  // Use convexQuery in Convex database call
  // Note: You need to create this API endpoint
  const data = useQuery(api.database.list, { 
    workspaceId,
    databaseId,
    filter: convexQuery 
  });
  
  return (
    <div>
      <h2>Convex Integration</h2>
      <div>Results: {data?.length || 0} items</div>
      <div>Convex Query: {JSON.stringify(convexQuery, null, 2)}</div>
    </div>
  );
}
```

## Example 3: Programmatic Filter Management

```typescript
import { useFilters } from '@/frontend/slices/database/filters';

interface Example3Props {
  properties: Property[];
}

function Example3_ProgrammaticFilters({ properties }: Example3Props) {
  const { 
    filters,
    addFilter, 
    clearFilters,
    setOperation,
    operation,
    filterCount,
    hasFilters
  } = useFilters({
    properties,
  });
  
  // Add text search filter
  const handleTextSearch = (searchTerm: string) => {
    addFilter({
      key: 'title',
      operator: 'contains',
      value: searchTerm
    });
  };
  
  // Add number range filter
  const handlePriorityFilter = (min: number, max: number) => {
    addFilter({
      key: 'priority',
      operator: 'between',
      value: [min, max]
    });
  };
  
  // Add multi-select filter
  const handleTagsFilter = (tags: string[]) => {
    addFilter({
      key: 'tags',
      operator: 'includesAnyOf',
      value: tags
    });
  };
  
  // Toggle AND/OR operation
  const handleToggleOperation = () => {
    setOperation(operation === 'AND' ? 'OR' : 'AND');
  };
  
  return (
    <div>
      <h2>Programmatic Filters</h2>
      
      <div>
        <button onClick={() => handleTextSearch('Task')}>
          Add Text Search
        </button>
        <button onClick={() => handlePriorityFilter(1, 5)}>
          Add Priority Filter (1-5)
        </button>
        <button onClick={() => handleTagsFilter(['urgent', 'important'])}>
          Add Tags Filter
        </button>
        <button onClick={handleToggleOperation}>
          Toggle {operation} Mode
        </button>
        <button onClick={clearFilters} disabled={!hasFilters}>
          Clear All ({filterCount})
        </button>
      </div>
      
      <pre>{JSON.stringify(filters, null, 2)}</pre>
    </div>
  );
}
```

## Example 4: Filter Presets

```typescript
import { useFilters } from '@/frontend/slices/database/filters';

interface Example4Props {
  properties: Property[];
  currentUserId: string;
}

function Example4_FilterPresets({ properties, currentUserId }: Example4Props) {
  const { filters, setFilters } = useFilters({ properties });
  
  // Preset: High Priority Tasks
  const applyHighPriorityPreset = () => {
    setFilters([
      { key: 'status', operator: 'is', value: 'active' },
      { key: 'priority', operator: 'greaterThanOrEquals', value: 4 }
    ]);
  };
  
  // Preset: This Week's Tasks
  const applyThisWeekPreset = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    setFilters([
      { 
        key: 'created_time', 
        operator: 'between', 
        value: [weekStart.getTime(), weekEnd.getTime()] 
      }
    ]);
  };
  
  // Preset: My Tasks
  const applyMyTasksPreset = () => {
    setFilters([
      { key: 'assigned_to', operator: 'contains', value: currentUserId },
      { key: 'status', operator: 'isNot', value: 'completed' }
    ]);
  };
  
  return (
    <div>
      <h3>Quick Filters</h3>
      <button onClick={applyHighPriorityPreset}>
        🔥 High Priority
      </button>
      <button onClick={applyThisWeekPreset}>
        📅 This Week
      </button>
      <button onClick={applyMyTasksPreset}>
        👤 My Tasks
      </button>
    </div>
  );
}
```

## Example 5: Save & Load Filters

```typescript
import { useFilters } from '@/frontend/slices/database/filters';
import { useState } from 'react';

interface Example5Props {
  properties: Property[];
}

function Example5_SaveLoadFilters({ properties }: Example5Props) {
  const { filters, setFilters } = useFilters({ properties });
  const [filterName, setFilterName] = useState('');
  
  // Save filters to localStorage
  const handleSaveFilters = () => {
    if (!filterName) return;
    
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '{}');
    savedFilters[filterName] = filters;
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
    alert(`Filters saved as "${filterName}"`);
  };
  
  // Load filters from localStorage
  const handleLoadFilters = (name: string) => {
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '{}');
    if (savedFilters[name]) {
      setFilters(savedFilters[name]);
    }
  };
  
  // Get list of saved filters
  const getSavedFilterNames = (): string[] => {
    const savedFilters = JSON.parse(localStorage.getItem('savedFilters') || '{}');
    return Object.keys(savedFilters);
  };
  
  return (
    <div>
      <h3>Save & Load Filters</h3>
      
      <div>
        <input 
          type="text" 
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Filter name" 
        />
        <button onClick={handleSaveFilters}>
          💾 Save
        </button>
      </div>
      
      <div>
        <h4>Saved Filters</h4>
        {getSavedFilterNames().map(name => (
          <button key={name} onClick={() => handleLoadFilters(name)}>
            📁 {name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Example 6: Filter Statistics

```typescript
import { useFilters } from '@/frontend/slices/database/filters';

interface Example6Props {
  properties: Property[];
  data: Record<string, any>[];
}

function Example6_FilterStatistics({ properties, data }: Example6Props) {
  const { 
    filters,
    applyFilters,
    hasFilters,
    filterCount
  } = useFilters({ properties });
  
  const filteredData = applyFilters(data);
  const filterPercentage = data.length > 0 
    ? ((filteredData.length / data.length) * 100).toFixed(1)
    : '0';
  
  return (
    <div className="stats">
      <div>
        <strong>Total Items:</strong> {data.length}
      </div>
      <div>
        <strong>Filtered Items:</strong> {filteredData.length}
      </div>
      <div>
        <strong>Filtered Out:</strong> {data.length - filteredData.length}
      </div>
      <div>
        <strong>Showing:</strong> {filterPercentage}%
      </div>
      <div>
        <strong>Active Filters:</strong> {filterCount}
      </div>
    </div>
  );
}
```

## Example 7: Advanced Nested Groups

```typescript
import { useFilterGroup } from '@/frontend/slices/database/filters';

interface Example7Props {
  properties: Property[];
}

function Example7_NestedGroups({ properties }: Example7Props) {
  const { 
    filterGroup, 
    convexQuery,
    updateFilterGroup 
  } = useFilterGroup({
    properties,
    initialFilterGroup: {
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
    }
  });
  
  // Result query: status = 'active' AND (priority = 5 OR tags contains 'urgent')
  
  return (
    <div>
      <h3>Nested Filter Groups</h3>
      <pre>{JSON.stringify(filterGroup, null, 2)}</pre>
      <h4>Convex Query</h4>
      <pre>{JSON.stringify(convexQuery, null, 2)}</pre>
    </div>
  );
}
```

## Example 8: Complete Integration

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFilters } from '@/frontend/slices/database/filters';

interface Example8Props {
  workspaceId: string;
  databaseId: string;
}

function Example8_CompleteIntegration({ workspaceId, databaseId }: Example8Props) {
  // Fetch database properties
  const database = useQuery(api.database.get, { 
    workspaceId, 
    databaseId 
  });
  
  const properties = database?.properties || [];
  
  // Setup filters
  const { 
    filters,
    filterFields,
    convexQuery,
    addFilter,
    removeFilter,
    clearFilters,
    setOperation,
    operation,
    hasFilters,
    filterCount
  } = useFilters({
    properties,
    onFiltersChange: (filters, query) => {
      console.log('Filters updated:', { filters, query });
    }
  });
  
  // Fetch filtered data from Convex
  const records = useQuery(api.database.listRecords, {
    workspaceId,
    databaseId,
    filter: convexQuery
  });
  
  if (!database) {
    return <div>Loading database...</div>;
  }
  
  return (
    <div className="database-view">
      <header>
        <h1>{database.name}</h1>
        <div className="filter-controls">
          <button onClick={() => setOperation(operation === 'AND' ? 'OR' : 'AND')}>
            {operation}
          </button>
          <button onClick={clearFilters} disabled={!hasFilters}>
            Clear All ({filterCount})
          </button>
        </div>
      </header>
      
      <main>
        <div className="records-list">
          {records?.map(record => (
            <div key={record._id} className="record-item">
              {/* Render record */}
              {record.title}
            </div>
          ))}
          
          {records?.length === 0 && (
            <div className="empty-state">
              No records found with current filters
            </div>
          )}
        </div>
      </main>
      
      <footer>
        <div>
          Showing {records?.length || 0} records
          {hasFilters && ` with ${filterCount} active filter${filterCount > 1 ? 's' : ''}`}
        </div>
      </footer>
    </div>
  );
}
```

## Key Patterns

### 1. Always Type Your Props
```typescript
interface MyComponentProps {
  properties: Property[];
  // ... other props
}

function MyComponent({ properties }: MyComponentProps) {
  // ...
}
```

### 2. Use Callbacks for Side Effects
```typescript
const { filters, convexQuery } = useFilters({
  properties,
  onFiltersChange: (filters, query) => {
    // Update URL params
    // Fetch new data
    // Analytics tracking
  }
});
```

### 3. Client-Side vs Server-Side
```typescript
// Client-side filtering (immediate)
const filteredData = applyFilters(data);

// Server-side filtering (with Convex)
const data = useQuery(api.database.list, { 
  filter: convexQuery 
});
```

### 4. Property Types Map
```typescript
const { propertyTypes } = useFilters({ properties });
// propertyTypes: { title: 'text', priority: 'number', ... }
```

## See Also

- [README.md](./README.md) - Complete documentation
- [types.ts](./types.ts) - Type definitions
- [useFilters.ts](./useFilters.ts) - Hook implementation
