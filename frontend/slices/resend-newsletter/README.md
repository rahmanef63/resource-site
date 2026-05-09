# `resend-newsletter` slice

Subscribe form + Convex action to send broadcasts via Resend.

## Wiring

```ts
// convex/schema.ts
import { newsletterTables } from "./features/newsletter/schema";
export default defineSchema({ ...newsletterTables });
```

Set env: `RESEND_API_KEY`, `RESEND_FROM` (both `convex` scope — push via `npx convex env set` for self-hosted).
