# Staging + E2E (2026-06-07)

## E2E (Playwright)

- Suite: `tests/e2e/site.spec.ts` — 7 smoke flows: home hero+nav, slices
  catalog → detail click-through, slice deep-link, changelog, bundle builder,
  admin API 401 gate, admin page no-leak.
- `npm run e2e` — build + run against a local prod server on :3137
  (`playwright.config.ts` webServer; dummy admin env baked so the login gate
  answers 401, not 500 "Server not configured").
- `npm run e2e:staging` — same suite against https://staging-resource.rahmanef.com.
- `E2E_BASE_URL=<url> npx playwright test` — any deployment.
- Deliberately NOT in pre-push (a full build + browser run is too slow there);
  run on demand or after a staging deploy.

## Staging

- Dokploy app `resource-site-staging` (project rahmanef-resources, same repo,
  **branch `staging`**, env + buildArgs cloned from prod, autoDeploy on push).
- URL: https://staging-resource.rahmanef.com (Hostinger A record + LE cert).
- Flow (solo-dev, main stays canonical):
  1. Risky change → `git push origin <sha-or-main>:staging` → Dokploy builds
     staging automatically.
  2. `npm run e2e:staging` to verify.
  3. Push main as usual (auto-deploys prod app `resource-site`).
- Staging shares the prod self-hosted Convex backend (api-resource.rahmanef.com)
  — fine for the read-mostly site; don't point destructive experiments at it.

## Gotchas

- Port 3137 was chosen because this VPS runs many apps; never set
  `reuseExistingServer: true` here (it once attached to a stranger's app on
  the old port and every assertion failed confusingly).
- `/api/admin/login` locally answers in ~30s flat with no Convex env (other
  routes <10ms; prod is fast). Unexplained; that one test carries a 90s
  timeout. TODO: profile.
