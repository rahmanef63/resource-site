import { test, expect } from "@playwright/test";

// Smoke E2E over the public site surface. Runs against a local production
// build by default (`npm run e2e`), or any deployment via E2E_BASE_URL.
// Assertions are anchored on stable copy (headings/titles), not styling.

test("home renders hero + nav", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Rahman Resources/i }),
  ).toBeVisible();
  await expect(page.locator("nav").first()).toBeVisible();
});

test("slices catalog lists slices and links to detail", async ({ page }) => {
  await page.goto("/slices");
  await expect(
    page.getByRole("heading", { name: /^Slices$/i }).first(),
  ).toBeVisible();
  const appshell = page.locator('a[href="/slices/appshell"]').first();
  await expect(appshell).toBeVisible();
  await appshell.click();
  await expect(page).toHaveURL(/\/slices\/appshell$/);
  await expect(page.getByText(/Desktop \+ Mobile OS Shell/i).first()).toBeVisible();
});

test("tour index renders hero + the six-Act rail", async ({ page }) => {
  await page.goto("/tour");
  // Hero h1 (CatalogHero) — stable copy, not styling.
  await expect(
    page.getByRole("heading", { level: 1, name: /^Grand Tour$/i }),
  ).toBeVisible();
  // The Act rail: each Act is a card with an h2 + an "Enter act" link to
  // /tour/<id>. Anchor on Act I and Act VI so the rail must be whole.
  await expect(
    page.getByRole("heading", { level: 2, name: /Act I — Marketing/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: /Act VI —/i }),
  ).toBeVisible();
  const enterAct = page.locator('a[href="/tour/marketing"]').first();
  await expect(enterAct).toBeVisible();
  await enterAct.click();
  await expect(page).toHaveURL(/\/tour\/marketing$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Act I — Marketing/i }),
  ).toBeVisible();
});

test("tour Act page deep-link renders its header + back-link", async ({
  page,
}) => {
  await page.goto("/tour/os-appshell");
  await expect(
    page.getByRole("heading", { level: 1, name: /Act II — OS & App Shell/i }),
  ).toBeVisible();
  // The "All acts" link returns to the rail (ActHeader chrome).
  await expect(page.locator('a[href="/tour"]').first()).toBeVisible();
});

test("slice detail deep-link renders metadata", async ({ page }) => {
  await page.goto("/slices/rate-limit");
  await expect(page.getByText(/rate.?limit/i).first()).toBeVisible();
  await expect(page.getByText(/Convex/i).first()).toBeVisible();
});

test("changelog shows entries", async ({ page }) => {
  await page.goto("/changelog");
  await expect(
    page.getByRole("heading", { name: /^Changelog$/i }).first(),
  ).toBeVisible();
  // At least one entry card with a version chip is rendered.
  await expect(page.getByText(/@/).first()).toBeVisible();
});

test("build (bundle builder) renders", async ({ page }) => {
  await page.goto("/build");
  await expect(page.getByText(/Builder|Bundle/i).first()).toBeVisible();
});

test("admin API rejects bad credentials", async ({ request }) => {
  // TODO: locally (next start, no Convex env) this route answers in ~30s
  // flat — other API routes are <10ms and prod is fast. Unexplained; bump
  // the timeout rather than mask the route. Investigate with a profiler.
  test.setTimeout(90_000);
  const res = await request.post("/api/admin/login", {
    data: { email: "e2e-bogus@example.com", password: "wrong-password" },
  });
  // 401 = gate working; 429 = limiter counting. Never 2xx.
  expect([401, 429]).toContain(res.status());
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("admin page does not leak content unauthenticated", async ({ page }) => {
  await page.goto("/admin");
  // Either the login form is shown or we are redirected to /admin-login —
  // never the admin panel content.
  await expect(page.getByText(/password|login|masuk/i).first()).toBeVisible();
});
