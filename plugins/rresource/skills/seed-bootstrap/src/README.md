# seed-bootstrap

Idempotent per-user starter data. localStorage marker locally; Convex mutation server-side.

## Local (no Convex)
```ts
import { seedLocallyOnce } from "./lib/clientSeed";
seedLocallyOnce(async () => {
  localStorage.setItem("docs", JSON.stringify(starterDocs));
});
```

## Convex (real users)
1. Copy `convex/seed.ts` to consumer's `convex/`.
2. Adjust the seed body to insert into your slice's tables.
3. Call from useAuth after signUp:
```ts
const seed = useMutation(api.seed.seedForCurrentUser);
await seed().catch(console.warn);
```
