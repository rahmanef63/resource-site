# oauth-providers

GitHub + Google OAuth via @convex-dev/auth.

## Env (server-only — NEVER NEXT_PUBLIC)
```
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## OAuth app callback URLs
- GitHub:  `https://<your-convex-site-url>/api/auth/callback/github`
- Google:  `https://<your-convex-site-url>/api/auth/callback/google`

## Wire
1. Replace your existing `convex/auth.ts` providers array with the snippet from `convex/auth-additions.ts`.
2. Run `pnpm backend:dev-sync`.
3. Frontend: `useAuthActions().signIn("github")` / `signIn("google")`.
