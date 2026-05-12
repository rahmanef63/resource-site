# Recipe: contact-form-resend

Contact form sending email via Resend. Source: cescadesigns.

Already at `recipes/contact-form-resend/src/` (copied verbatim).

## Setup

```bash
npm i resend
```

Set `.env.local`:
```
RESEND_API_KEY=re_xxx
```

## Wire route handler

```ts
// app/api/contact/route.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const data = await req.formData();
  await resend.emails.send({
    from: "form@yourdomain.com",
    to: "you@yourdomain.com",
    subject: `New message from ${data.get("name")}`,
    html: `<p>${data.get("message")}</p>`,
  });
  return Response.json({ ok: true });
}
```

## Mount form

```tsx
import { ContactForm } from "@/recipes/contact-form-resend/ContactForm";
<ContactForm action="/api/contact" />
```

## Validate

Use Zod on server-side input (audit-bp P0 for Server Actions).
