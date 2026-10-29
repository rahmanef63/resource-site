import { expect, it } from "vitest";
import { readFileSync } from "node:fs";

const sliceRoute = "app/(docs)/slices/[slug]/page.tsx";
const agentRoute = "app/(docs)/agents/[slug]/page.tsx";

it("disallows the admin login route in robots.txt", () => {
  const robots = readFileSync("app/robots.ts", "utf8");
  expect(robots).toContain('"/admin-login"');
});

it("keeps the admin login route out of the index", () => {
  const page = readFileSync("app/admin-login/page.tsx", "utf8");
  expect(page.trimStart().startsWith('"use client"')).toBe(false);
  expect(page).toContain("robots: { index: false, follow: false }");
  // Form (hooks + useSearchParams) lives in the client child.
  const form = readFileSync("app/admin-login/login-form.tsx", "utf8");
  expect(form.trimStart().startsWith('"use client"')).toBe(true);
  expect(form).toContain('fetch("/api/admin/login"');
  expect(form).toContain("router.replace(params.get(\"next\") || \"/admin\")");
});

it("turns unknown detail slugs into 404s rather than not-found titles", () => {
  for (const file of [sliceRoute, agentRoute]) {
    const src = readFileSync(file, "utf8");
    const meta = src.slice(
      src.indexOf("export async function generateMetadata"),
      src.indexOf("export default async function"),
    );
    expect(meta).toContain("notFound()");
    expect(meta).not.toMatch(/title:\s*"[^"]*not found/i);
  }
});

it("emits per-page social metadata from the shared seo helper", () => {
  const seo = readFileSync("lib/seo.ts", "utf8");
  expect(seo).toContain("export function buildPageMetadata");
  expect(seo).toContain("openGraph");
  expect(seo).toContain('card: "summary_large_image"');
  for (const file of [sliceRoute, agentRoute]) {
    const src = readFileSync(file, "utf8");
    expect(src).toContain('from "@/lib/seo"');
    expect(src).toContain("buildPageMetadata(");
  }
});

it("redirects unauthenticated admin visitors on the server, not via meta refresh", () => {
  const layout = readFileSync("app/admin/layout.tsx", "utf8");
  expect(layout).toContain('redirect("/admin-login")');
  // A streaming boundary around the cookie guard produced a streamed 200
  // shell plus `__next-page-redirect`; the guard must render inline.
  expect(layout).not.toContain("<Suspense");
  expect(layout).not.toContain('import { Suspense }');
});
