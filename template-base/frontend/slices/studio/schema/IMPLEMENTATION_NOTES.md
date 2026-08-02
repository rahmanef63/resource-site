# Studio Schema Validation System — Implementation Notes

## Architecture

```
schema/
  constants/       Re-exports from StudioUISchema.ts (the canonical SSOT)
  json-schema/     AJV-compatible JSON Schema files (Draft 2020-12)
  types/           TypeScript types for the validation system
  normalize/       Normalisation pipeline (aliases, migrations, prop cleanup)
  validate/        Validators (AJV + graph rules + business rules + orchestrator)
  utils/           Error formatting and schema guards
  __tests__/       Vitest tests + JSON fixtures
  index.ts         Public API
```

### Source of Truth

All widget types, prop schemas, and alias maps live in:

```
frontend/slices/studio/ui/types/StudioUISchema.ts
```

The `constants/` folder re-exports from there — **do not duplicate**.

---

## Strict vs Lenient Mode

| Behaviour | strict | lenient |
|---|---|---|
| Alias props (direction→flexDirection) | Error | Auto-fix + warning |
| Bare number gap ("4") | Error | Warning |
| T-shirt gap size ("lg") | Warning + auto-resolve | Auto-resolve |
| Orphan nodes | Error | Warning |
| Normaliser runs by default | No | Yes |

Use **strict** for save/export/production.  
Use **lenient** for AI generation, raw import, draft editing.

---

## Alias Policy

Internal representation: `flexDirection`, `justifyContent`, `alignItems`, `flexWrap`, `backgroundColor`.

Accepted in lenient mode: `direction`, `justify`, `align`, `wrap`, `background`, `bg`.

All alias resolution happens in `normalize/normalizeNodeProps.ts`. The canonical alias map is in `constants/aliases.ts` (imported from `StudioUISchema.ts`).

---

## Runtime-only Rules (not in JSON Schema)

These rules cannot be expressed in JSON Schema Draft 2020-12 because they require full document traversal:

| Rule | Code | File |
|---|---|---|
| All root IDs exist in nodes | UNKNOWN_ROOT_ID | validateGraphRules.ts |
| All children IDs exist in nodes | UNKNOWN_CHILD_ID | validateGraphRules.ts |
| No circular references | CIRCULAR_REFERENCE | validateGraphRules.ts |
| Each node has ≤1 parent | MULTIPLE_PARENTS | validateGraphRules.ts |
| Root nodes have no parent | ROOT_HAS_PARENT | validateGraphRules.ts |
| All nodes reachable from root | ORPHAN_NODE | validateGraphRules.ts |
| Smart blocks not nested in smart blocks | SMART_BLOCK_NESTING | validateBusinessRules.ts |
| Duplicate route paths | DUPLICATE_ROUTE_PATH | validateBusinessRules.ts |

---

## Validation Pipeline Order

```
normalizeStudioDocument (if normalize:true or mode:lenient)
  └── migrateV04ToV05 (if version:"0.4")
  └── normalizeNodeProps (per node)
        └── alias resolution
        └── t-shirt size resolution
        └── CSS unit validation (strict only)

validateUiWithAjv / validateStudioWithAjv
  └── JSON Schema structural check

validateGraphRules
  └── root IDs, child IDs, cycles, single-parent, orphans

validateBusinessRules
  └── section usage, gap units, flexDirection, smart block nesting, paths
```

---

## Adding a New Widget Type

1. Add props schema to `StudioUISchema.ts` (Zod)
2. Add entry to `WIDGET_REGISTRY` in `StudioUISchema.ts`
3. If it's a Smart Block: add to `SMART_BLOCK_TYPES` in `schema/constants/smartBlocks.ts`
4. If it has special business rules: add check in `schema/validate/validateBusinessRules.ts`
5. No changes needed to JSON Schema or AJV setup (the JSON Schema validates widget types permissively; runtime checks use `KNOWN_WIDGET_TYPES`)

---

## Adding a New Prop Enum

1. Add the enum/regex to `StudioUISchema.ts`
2. Re-export from `schema/constants/propEnums.ts` if needed for external use
3. Add validation in `normalizeNodeProps.ts` or `validateBusinessRules.ts`

---

## API Usage Examples

```typescript
import { validateStudioDocument } from "@/frontend/slices/studio/schema";

// Lenient — AI generation / raw import
const result = validateStudioDocument(aiGeneratedJson, {
  mode: "lenient",
  normalize: true,
});

if (!result.valid) {
  console.error("Errors:", result.errors);
}
console.log("Warnings:", result.warnings);
console.log("Normalised document:", result.normalizedDocument);

// Strict — production export
const exportResult = validateStudioDocument(schema, { mode: "strict" });
if (!exportResult.valid) throw new Error("Cannot export invalid schema");
```

```typescript
import { validateUiSchema } from "@/frontend/slices/studio/schema";

// UI-only schema validation
const result = validateUiSchema(rawJson, { mode: "strict", normalize: false });
```

```typescript
import { groupByNode, formatIssue } from "@/frontend/slices/studio/schema";

// Display errors in inspector UI
const byNode = groupByNode(result.errors);
const nodeErrors = byNode.get("my-node-id") ?? [];
```
