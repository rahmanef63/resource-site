# Example Feature

> **A minimal reference implementation for learning SuperSpace patterns**

This feature serves as a learning resource for new developers. Every file contains detailed comments explaining the patterns and conventions used in SuperSpace.

---

## ⚠️ Setup Required

This is a **learning reference** feature. To make it fully functional:

### 1. Register the schema

Add to `convex/schema.ts`:
```typescript
import { exampleTables } from "./features/example/schema"

// Add to the schema definition:
...exampleTables,
```

### 2. Fix the category

Update `config.ts` line 77 to use a valid category:
```typescript
category: 'productivity',  // Instead of 'tools'
```

### 3. Sync and deploy

```bash
pnpm run sync:all
npx convex dev
```

---

## 📁 File Structure

```
frontend/slices/example/
├── config.ts              # Feature configuration (SSOT)
├── page.tsx               # Entry point component
├── views/
│   └── ExampleView.tsx    # Main view with UI
├── agents/
│   └── index.ts           # AI agent registration
└── settings/
    └── index.ts           # Feature settings

convex/features/example/
├── schema.ts              # Database table definitions
├── queries.ts             # Read operations
├── mutations.ts           # Write operations
├── agents/
│   └── index.ts           # Server-side AI handlers
└── index.ts               # Barrel exports
```

---

## 🎓 What You'll Learn

### Frontend (React)

| File | Concepts |
|------|----------|
| `config.ts` | Feature definition, SSOT pattern, auto-discovery |
| `page.tsx` | Entry points, workspaceId guards, component delegation |
| `ExampleView.tsx` | useQuery, useMutation, loading states, UI composition |
| `agents/index.ts` | AI agent registration, tool definitions, routing |
| `settings/index.ts` | Settings storage, Zustand/Jotai patterns |

### Backend (Convex)

| File | Concepts |
|------|----------|
| `schema.ts` | Table definitions, indexes, multi-tenancy |
| `queries.ts` | Reactive queries, RBAC, data fetching |
| `mutations.ts` | Transactions, RBAC, audit logging |

---

## 🔑 Key Patterns

### 1. SSOT (Single Source of Truth)

All feature metadata lives in `config.ts`. The system auto-discovers features from these files.

### 2. RBAC (Role-Based Access Control)

```typescript
// Always check permissions before operations
await requirePermission(ctx, workspaceId, 'example.create')
```

### 3. Audit Logging

```typescript
// Always log mutations for compliance
await logAuditEvent(ctx, {
    action: "example.item.created",
    resourceType: "exampleItem",
    resourceId: itemId,
    workspaceId,
})
```

### 4. Multi-Tenancy

```typescript
// Always scope queries to workspace
ctx.db.query("exampleItems")
    .withIndex("by_workspace", q => q.eq("workspaceId", workspaceId))
```

---

## 🚀 Using This as a Template

```bash
# Create a new feature based on this example
pnpm run create:feature my-feature

# Or copy manually and rename
cp -r frontend/slices/example frontend/slices/my-feature
cp -r convex/features/example convex/features/myFeature
```

---

## 📚 Further Reading

- [00_BASE_KNOWLEDGE.md](../../../docs/00_BASE_KNOWLEDGE.md) - Core concepts
- [01-FEATURE-RULES.md](../../../docs/rules/01-FEATURE-RULES.md) - Development rules
- [02-MUTATION-GUIDE.md](../../../docs/rules/02-MUTATION-GUIDE.md) - Convex patterns
