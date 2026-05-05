# audit-log

Append-only user-action trail. Default → localStorage ring buffer (1k). Opt-in → Convex.

## Use (local)
```ts
import { logAuditLocal } from "./lib/audit";
logAuditLocal({ action: "doc.delete", targetId: "abc", meta: { reason } });
```

## View (local)
```tsx
<AuditLogView />   // reads localStorage
```

## Use (Convex)
1. Copy `convex/audit.ts` + add schema fragment.
2. `const append = useMutation(api.audit.append); append({ action: "doc.delete" });`
3. `<AuditLogView entries={useQuery(api.audit.listRecent) ?? []} />`
