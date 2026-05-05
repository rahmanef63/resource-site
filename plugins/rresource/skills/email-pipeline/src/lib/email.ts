// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { Resend } from "resend";

const RATE = { perMin: 10, perHour: 100 };
const counters = new Map<string, { min: number; minReset: number; hour: number; hourReset: number }>();

function checkRate(key: string) {
  const now = Date.now();
  const c = counters.get(key) ?? { min: 0, minReset: now + 60_000, hour: 0, hourReset: now + 3_600_000 };
  if (now > c.minReset) { c.min = 0; c.minReset = now + 60_000; }
  if (now > c.hourReset) { c.hour = 0; c.hourReset = now + 3_600_000; }
  if (c.min >= RATE.perMin) throw new Error("Email rate-limited (per minute)");
  if (c.hour >= RATE.perHour) throw new Error("Email rate-limited (per hour)");
  c.min++; c.hour++;
  counters.set(key, c);
}

export type EmailTemplate = "welcome" | "reset-password" | "notify";

const TEMPLATES: Record<EmailTemplate, (data: Record<string, string>) => { subject: string; html: string }> = {
  welcome: (d) => ({ subject: `Welcome, ${d.name ?? "friend"}!`, html: `<p>Hi ${d.name ?? "there"} — welcome aboard.</p>` }),
  "reset-password": (d) => ({ subject: "Reset your password", html: `<p>Click <a href="${d.url}">here</a> to reset. Expires in 30 minutes.</p>` }),
  notify: (d) => ({ subject: d.subject ?? "Notification", html: `<p>${d.body ?? ""}</p>` }),
};

export async function sendEmail(opts: {
  template: EmailTemplate;
  to: string;
  data?: Record<string, string>;
  from?: string;
  rateKey?: string;
}): Promise<{ id: string }> {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  checkRate(opts.rateKey ?? opts.to);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { subject, html } = TEMPLATES[opts.template](opts.data ?? {});
  const res = await resend.emails.send({
    from: opts.from ?? process.env.EMAIL_FROM ?? "no-reply@example.com",
    to: opts.to,
    subject,
    html,
  });
  if (res.error) throw new Error(res.error.message);
  return { id: res.data?.id ?? "" };
}
