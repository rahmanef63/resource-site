// Template subdomain SSOT — Operasi BR-wave (2026-05-20).
//
// Maps `demo-<short>.rahmanef.com` host headers to internal template
// slugs so proxy.ts can rewrite requests to the right /preview/<slug>
// route. Single source of truth — both proxy.ts and layouts.ts read
// from here.
//
// Why this exists: 8 templates each deserve a domain-flavored demo
// URL for portfolio + sharing. Instead of forking the rr repo 8×
// (overpower — see rejected proposal in BR ultraplan), all subdomains
// resolve to the same Next.js deployment via host-based rewriting.
// Edit anything in rr → push → Dokploy rebuild → all 8 subdomains
// reflect change in next request. Zero sync engine.

/** Domain rr is deployed under. Subdomain matching strips this suffix. */
export const ROOT_DOMAIN = "rahmanef.com";

/** Marker prefix for demo subdomains. Anything not matching is passed
 *  through (rahmanef.com main site, resource.rahmanef.com canonical,
 *  any future subdomain). */
export const DEMO_PREFIX = "demo-";

/** Subdomain shortname → template slug. Adding a row here is the only
 *  edit needed to publish a new template demo URL — proxy.ts and
 *  layouts.ts derive everything else. */
export const SUBDOMAIN_TO_SLUG: Record<string, string> = {
  "demo-personal-branding": "personal-brand-os",
  "demo-konsultan": "konsultan-os",
  "demo-kreator": "kreator-studio-os",
  "demo-wirausaha": "wirausaha-os",
  "demo-riset": "riset-kit",
  "demo-agency": "agency-studio-os",
  "demo-saas": "saas-marketing-os",
  "demo-nosion": "notion-page-clone-os",
};

/** Inverse — `getSubdomainForSlug("konsultan-os") === "demo-konsultan"`. */
export const SLUG_TO_SUBDOMAIN: Record<string, string> = Object.fromEntries(
  Object.entries(SUBDOMAIN_TO_SLUG).map(([sub, slug]) => [slug, sub]),
);

/** External Vercel demo SSOT — the deployed standalone app per template.
 *  When a slug has an entry here, rr no longer renders its own /preview for
 *  the catalog/subdomain: the catalog embeds this URL (poster → live iframe)
 *  and proxy.ts redirects the demo subdomain straight to it (offloading demo
 *  traffic from rr). Add a row once a template is deployed PUBLIC (Vercel
 *  deployment-protection OFF) so the URL is iframe-able. Use a STABLE alias,
 *  not the per-deploy immutable URL. */
export const SLUG_TO_DEMO_URL: Record<string, string> = {
  "personal-brand-os": "https://personal-brand-os-ten.vercel.app",
  "agency-studio-os": "https://agency-studio-os.vercel.app",
  "konsultan-os": "https://konsultan-os.vercel.app",
  "kreator-studio-os": "https://kreator-studio-os.vercel.app",
  "riset-kit": "https://riset-kit.vercel.app",
  "saas-marketing-os": "https://saas-marketing-os-omega.vercel.app",
  "wirausaha-os": "https://wirausaha-os.vercel.app",
  // notion-page-clone-os: no standalone content repo yet (the cms-public-storefront
  // repo is the bare rr starter). Stays on poster/preview until a real deploy exists.
};

/** External Vercel demo URL for a slug, or null if not yet published. */
export function getExternalDemoUrl(slug: string): string | null {
  return SLUG_TO_DEMO_URL[slug] ?? null;
}

/** Parse the leftmost label from a Host header and resolve to a slug.
 *  Returns null when not a known demo subdomain (caller should pass
 *  request through without rewriting). */
export function resolveDemoSlug(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0]; // strip port (local dev safety)
  if (!hostname.endsWith(`.${ROOT_DOMAIN}`)) return null;
  const subdomain = hostname.slice(0, -1 * (ROOT_DOMAIN.length + 1));
  if (!subdomain.startsWith(DEMO_PREFIX)) return null;
  return SUBDOMAIN_TO_SLUG[subdomain] ?? null;
}

/** Build the public demo URL for a slug. Returns null when slug has
 *  no subdomain mapping. Used by /templates/<slug> detail page to
 *  render the "Visit live demo" link. */
export function getDemoUrl(slug: string): string | null {
  const subdomain = SLUG_TO_SUBDOMAIN[slug];
  if (!subdomain) return null;
  return `https://${subdomain}.${ROOT_DOMAIN}`;
}
