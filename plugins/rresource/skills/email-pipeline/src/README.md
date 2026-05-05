# email-pipeline

Resend wrapper + in-memory rate limit + template registry. Server-only.

## Install
```bash
pnpm add resend zod
```

## Env
```
RESEND_API_KEY=re_...
EMAIL_FROM=no-reply@yourdomain.com
```

## Use
```ts
// any route handler / server action
import { sendEmail } from "@/shared/lib/email";
await sendEmail({ template: "welcome", to: user.email, data: { name: user.name } });
```

## Add a template
Edit `TEMPLATES` map at top of `lib/email.ts`. Keep subject/body small.

## NEVER expose RESEND_API_KEY to client
No `NEXT_PUBLIC_*`. Server runtime only.
