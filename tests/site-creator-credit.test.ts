import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { site } from "../lib/content/site";

it("uses an explicit canonical human author, not a keyword-rich endorsement", () => {
  expect(site.author).toBe("Rahman Fakhru");
  expect(site.authorUrl).toBe("https://rahmanef.com");
  const footer = readFileSync("components/site/site-footer.tsx", "utf8");
  expect(footer).toContain("href={site.authorUrl}");
  expect(footer).toContain("{site.author}");
});
it("mounts the existing credit on the owned landing page only", () => {
  const shell = readFileSync("components/site/site-shell.tsx", "utf8");
  expect(shell).toContain('pathname === "/" ? <SiteFooter /> : null');
  expect(shell).toContain('if (bare) return <>{children}</>');
});
it("adds the landing canonical without canonicalising nested docs to home", () => {
  expect(readFileSync("app/page.tsx", "utf8")).toContain("canonical: site.url");
  expect(readFileSync("app/layout.tsx", "utf8")).not.toContain("canonical: site.url");
});
