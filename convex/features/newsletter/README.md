# `newsletter` Convex feature

Backend for `frontend/slices/resend-newsletter/`.

- `mutation.subscribe` — public single opt-in with honeypot + per-email rate limiting.
- `mutation.unsubscribe` — public idempotent unsubscribe.
- `query.activeSubscribers` / `query.getIssue` — internal worker queries only.
- `actions/send.sendCampaign` — internal campaign creation/scheduling.
- `actions/send.broadcast` — internal delivery worker; the only operation that calls Resend.

Tables: `newsletterSubscribers`, `newsletterIssues`, `newsletterSubscribeAttempts`.

Required server env: `RESEND_API_KEY`, `RESEND_FROM`.

The feature intentionally does **not** bundle a public subscriber-list or campaign-send endpoint. Bind `ResendNewsletterCtx.listSubscribers` / `sendBroadcast` to your own authenticated server actions and call the internal newsletter functions only after host authz. This keeps the slice portable instead of depending on one app's user/profile schema.
