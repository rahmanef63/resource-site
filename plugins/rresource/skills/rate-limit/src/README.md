# rate-limit

Per-user token bucket inside Convex (no Redis). Default 10/min + 100/day.

## Install
1. Copy `convex/_shared/rateLimit.ts` to consumer's `convex/_shared/`.
2. Add the schema fragment (commented at top of file) to `convex/schema.ts`.
3. Run `pnpm backend:dev-sync`.

## Use
```ts
import { requireQuota } from "./_shared/rateLimit";

export const myAction = action({
  args: { ... },
  handler: async (ctx, args) => {
    await requireQuota(ctx);   // throws on exceed
    // … real work
  },
});
```

## Tuning
Edit `MIN_BUCKET` / `DAY_BUCKET` at top of file.
