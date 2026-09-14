# `newsletter` Convex feature

Backend for `frontend/slices/resend-newsletter/`.

- `mutation.subscribe` — public single opt-in with honeypot + per-email rate limiting.
- `mutation.unsubscribe` — public idempotent unsubscribe.
- `query.listSubscribersPublic` — authenticated admin-only list.
- `actions/send.sendCampaignPublic` — authenticated admin-only campaign creation + scheduled Resend fanout.
- `actions/send.broadcast` — internal delivery worker; this is the only operation that calls Resend.

Tables: `newsletterSubscribers`, `newsletterIssues`, `newsletterSubscribeAttempts`.

Required server env: `RESEND_API_KEY`, `RESEND_FROM`. The feature also relies on the host's existing Convex Auth/user profile admin contract.
