# Config Directory

> **Data Model Definitions & Field Configurations**

This directory contains the **domain model** and business logic constants for the database feature.

---

## 📁 Files

### `fields.ts`
**Purpose:** Property/field type definitions and metadata

**Exports:**
- `DatabaseFieldDefinition` - Interface for field definitions
- `DATABASE_FIELD_DEFINITIONS` - Complete registry of all field types with:
  - Type identifier
  - Display label
  - Description
  - Icon component
  - Capabilities (supportsOptions, isMultiValue)

**Usage:**
```typescript
import { DATABASE_FIELD_DEFINITIONS } from '../config/fields';

const fieldDef = DATABASE_FIELD_DEFINITIONS['select'];
console.log(fieldDef.label); // "Select"
console.log(fieldDef.supportsOptions); // true
```

**Also Exports:**
- `MULTI_VALUE_FIELD_TYPES` - Set of fields that can have multiple values
- `OPTION_BASED_FIELD_TYPES` - Set of fields that use options (select, multi-select)

---

### `mappings.ts`
**Purpose:** Field type mappings and keyword inference

**Exports:**
- `FIELD_KEYWORDS` - Keywords for auto-detecting field types from names
- `DATE_FIELD_TYPES` - Set of date-related field types
- `SELECT_FIELD_TYPES` - Set of select-related field types  
- `PERSON_FIELD_TYPES` - Set of person/people field types

**Usage:**
```typescript
import { FIELD_KEYWORDS } from '../config/mappings';

// Auto-detect field type from name
if (fieldName.toLowerCase().includes('status')) {
  // Use 'status' or 'select' type
}
```

---

## 🎯 When to Add Here

Use this directory for:
- ✅ **Data model definitions** - Field types, property schemas
- ✅ **Business logic constants** - Field behaviors, capabilities
- ✅ **Domain mappings** - Type conversions, keyword inference
- ✅ **Entity metadata** - Labels, descriptions, icons

Do NOT use for:
- ❌ **UI constants** - Colors, layouts, CSS classes → use `constants/`
- ❌ **View configurations** - View type mappings → use `constants/`
- ❌ **Component props** - React component configurations → use component files

---

## 🔗 Related Directories

| Directory | Purpose | Relationship |
|-----------|---------|--------------|
| `constants/` | UI & view layer constants | Sibling - presentation layer |
| `types/` | TypeScript type definitions | Consumed by config files |
| `properties/` | Property implementations | Uses config definitions |
| `registry/` | Property registration system | Uses config for metadata |

---

## 📝 Best Practices

1. **Immutability** - Use `as const` for constant objects
2. **Type Safety** - Export both types and values
3. **Documentation** - Add JSDoc comments for all exports
4. **Naming** - Use SCREAMING_SNAKE_CASE for constants
5. **Organization** - Group related constants in same file

---

## 🚀 Adding New Field Type

When adding a new field type:

1. Add to `fields.ts`:
```typescript
export const DATABASE_FIELD_DEFINITIONS = {
  // ...
  my_new_type: {
    type: "my_new_type",
    label: "My New Type",
    description: "Description here",
    icon: MyIcon,
    supportsOptions: false,
  },
};
```

2. Update relevant sets if needed:
```typescript
export const MULTI_VALUE_FIELD_TYPES = new Set<DatabaseFieldType>([
  // ...
  "my_new_type", // if it supports multiple values
]);
```

3. Add keywords to `mappings.ts` if auto-detection needed:
```typescript
export const FIELD_KEYWORDS = {
  // ...
  my_new_type: ["keyword1", "keyword2"],
};
```

---

**Last Updated:** November 9, 2025
