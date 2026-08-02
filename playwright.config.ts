import { defineConfig } from "@playwright/test";

// E2E against a local PRODUCTION build (deterministic, no staging required).
// `npm run e2e` builds first; this config only starts the built server.
// Against staging instead: E2E_BASE_URL=https://staging-resource.rahmanef.com npx playwright test
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3137";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 1,
  workers: 2,
  reporter: [["list"]],
  use: { baseURL },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npx next start --port 3137",
        url: "http://127.0.0.1:3137",
        // Never attach to a stranger's server — this VPS runs many apps.
        reuseExistingServer: false,
        timeout: 60_000,
        // Dummy admin env so the login gate answers 401 fast instead of 500
        // "Server not configured" (no real secrets — E2E never logs in).
        env: {
          ADMIN_EMAIL: "e2e@example.com",
          ADMIN_PASSWORD_HASH: "e2esalt:" + "cd".repeat(64), // scrypt salt:hash shape
          ADMIN_SESSION_SECRET: "e2e-session-secret-not-real",
        },
      },
});
