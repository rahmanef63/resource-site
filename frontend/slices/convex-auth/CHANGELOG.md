# Convex Auth changelog

## 0.5.0 — 2026-09-15

- Added native Svelte 5/SvelteKit AuthCard and SignInPage distribution.
- Extracted provider/FormData/error orchestration into framework-neutral `createAuthFlow()`.
- React `useAuthFlow()` now stays a thin adapter over the official `@convex-dev/auth/react` export.
- Svelte SignInPage requires a host-supplied `AuthFlow`; no undocumented auth/session internals are reimplemented.
- Corrected React dependency metadata to include `lucide-react` and aligned `@convex-dev/auth` to `^0.0.95`.
