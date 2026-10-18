import { describe, expect, it } from "vitest";
import { canonicalResourceUrl, legacyResourceRedirect } from "./site-routing";
import { site } from "./content/site";
import { resolveDemoSlug, SUBDOMAIN_TO_SLUG } from "./content/template-subdomains";

describe("Manef Resource product migration", () => {
  it("identifies Manef without removing creator attribution", () => {
    expect(site.name).toBe("Manef Resource");
    expect(site.publisher).toBe("Manef");
    expect(site.url).toBe("https://resource.manef.dev");
    expect(site.author).toBe("Rahman Fakhru");
  });
  it.each(["/", "/slices/ai-core?tab=code&framework=sveltekit", "/api/knowledge?type=slice"]) (
    "preserves the path and query: %s", (path) => {
      const target = legacyResourceRedirect(new URL(`https://resource.rahmanef.com${path}`));
      expect(target?.href).toBe(`https://resource.manef.dev${path}`);
    },
  );
  it("does not create an open redirect for a scheme-relative path", () => {
    const target = legacyResourceRedirect(new URL("https://resource.rahmanef.com//evil.example/path?q=1"));
    expect(target?.origin).toBe(site.url);
    expect(target?.pathname).toBe("//evil.example/path");
  });
  it.each(["resource.manef.dev", "rahmanef.com", "resource.rahmanef.com.evil.example"]) (
    "never redirects another host: %s", (host) => {
      expect(legacyResourceRedirect(new URL(`https://${host}/docs`))).toBeNull();
    },
  );
  it("keeps all eight existing demo-host mappings separate", () => {
    expect(Object.keys(SUBDOMAIN_TO_SLUG)).toHaveLength(8);
    for (const [host, slug] of Object.entries(SUBDOMAIN_TO_SLUG)) {
      const url = new URL(`https://${host}.rahmanef.com/contact`);
      expect(legacyResourceRedirect(url)).toBeNull();
      expect(resolveDemoSlug(url.host)).toBe(slug);
    }
  });
  it("uses a per-page canonical without tracking query parameters", () => {
    expect(canonicalResourceUrl(new URL(`${site.url}/docs?utm_source=old`))?.href).toBe(`${site.url}/docs`);
  });
  it.each(["/admin", "/admin-login", "/api/knowledge", "/preview/slices/ai-core", "/brand-assets/icon.svg"]) (
    "does not add public canonical headers to %s", (path) => {
      expect(canonicalResourceUrl(new URL(site.url + path))).toBeNull();
    },
  );
});
