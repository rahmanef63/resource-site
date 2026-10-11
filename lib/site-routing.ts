import { site } from "./content/site";

const legacyHost = new URL(site.legacyUrl).hostname;
const canonicalHost = new URL(site.url).hostname;

/** Change only the trusted origin; never interpret a request path as a URL. */
export function legacyResourceRedirect(requestUrl: URL): URL | null {
  if (requestUrl.hostname !== legacyHost) return null;
  const target = new URL(site.url);
  target.pathname = requestUrl.pathname;
  target.search = requestUrl.search;
  return target;
}

/** Per-page HTTP canonical, excluding private, preview, API and asset surfaces. */
export function canonicalResourceUrl(requestUrl: URL): URL | null {
  if (requestUrl.hostname !== canonicalHost) return null;
  const path = requestUrl.pathname;
  if (/^\/(?:api|admin|admin-login|preview|_next|brand-assets)(?:\/|$)/.test(path)) return null;
  if (/\.[a-z0-9]+$/i.test(path)) return null;
  const target = new URL(site.url);
  target.pathname = path;
  return target;
}
