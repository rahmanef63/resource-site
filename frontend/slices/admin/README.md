# Admin

Access-gated admin surfaces behind one slug.

```bash
npx rr add admin shell      # minimal generic admin shell (convex/features/admin)
npx rr add admin console     # composed 26-section console (convex/features/admin_console)
npx rr add admin             # both
```

Each variant pulls only its own Convex backend (per-variant convex gating).
`shell` gates on `SUPER_ADMIN_EMAIL`; `console` on `PLATFORM_ADMIN_EMAILS` +
the 5-level AccessGate — standardize on one in your app.
