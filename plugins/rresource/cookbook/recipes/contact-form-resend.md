# Recipe — Contact Form + Resend

> **Portability tier:** S
> **Origin source:** cescadesigns (`~/projects/cescadesigns/app/contact/`)

## Tujuan

Contact form posting to Resend email API. Server Action + Zod input validation.

## Files

recipes/contact-form-resend/src/page.tsx
app/api/contact/route.ts

## Integration example

```tsx
// app/api/contact/route.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const data = await req.formData();
  await resend.emails.send({
    from: "form@yourdomain.com",
    to: "you@yourdomain.com",
    subject: `From ${data.get("name")}`,
    html: `<p>${data.get("message")}</p>`,
  });
  return Response.json({ ok: true });
}
```

## Agent recipe

Wire ContactForm.tsx (form action /api/contact) to the route handler. Always validate inputs with Zod server-side. Add rate-limiter (@upstash/ratelimit or in-memory token bucket) before the Resend call.

## Schema / npm / env

Recipe-specific. Read source files for exact requirements. Most
notion-page-clone recipes need:
- Convex schema additions (pages, blocks, comments, databaseRows)
- @dnd-kit/core + @dnd-kit/sortable for dnd recipes
- Zustand store at frontend/slices/notion/shared/lib/store.tsx

## Common breakage

- Vite→Next port issues: missing `"use client"` markers, route param
  shape (`[slug]` vs `:slug`), Convex API surface rename.
- Path aliases mismatch — fix `tsconfig.json` once.
