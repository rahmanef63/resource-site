# `example-feature` — convex backend half

Pairs with the frontend slice at `frontend/slices/_templates/example-feature/`.

## Files

| File | Role |
|---|---|
| `schema.ts` | Exports `exampleFeatureTables` — spread into the consumer's root `convex/schema.ts`. |
| `queries.ts` | Public read fns. |
| `mutations.ts` | Public write fns; `getAuthUserId` enforces ownership. |

## Wiring into a consumer's convex

```ts
// convex/schema.ts (consumer)
import { defineSchema } from "convex/server";
import { exampleFeatureTables } from "./features/example-feature/schema";
import { authTables } from "@convex-dev/auth/server"; // peer slice

export default defineSchema({
  ...authTables,
  ...exampleFeatureTables,
});
```

After spreading, run `npx convex dev --once` to regenerate `_generated/`.
