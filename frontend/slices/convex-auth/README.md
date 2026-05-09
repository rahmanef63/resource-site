# `convex-auth` slice

Email magic-link authentication via `@convex-dev/auth` + Resend.

## What ships

- Frontend: `<SignInPage>` stub component + slice config registered as `auth` category.
- Backend: `authTablesExt` schema fragment (composes with `@convex-dev/auth`'s built-in `authTables`).

## Wiring (consumer)

```ts
// convex/schema.ts
import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { authTablesExt } from "./features/auth/schema";

export default defineSchema({ ...authTables, ...authTablesExt });
```

```ts
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@convex-dev/auth/providers/Resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend({ from: "auth@yourdomain.com" })],
});
```

```ts
// app/proxy.ts (Next 16 — NOT middleware.ts)
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware();
```

## Lift the real implementation

The kitab ships the structural shell. Pull the working sign-in form, RBAC helpers, and OAuth providers from superspace:

```bash
npx rahman-resources lift superspace:frontend/slices/auth .
```
