# Wildcard Subdomain Demo Routing (BR-wave, 2026-05-20)

> Every website template gets a domain-flavored demo URL without
> forking the rr repo. Single Dokploy container serves all
> `demo-<short>.rahmanef.com` subdomains via host-based rewriting.

## Why this exists

**Problem:** 8 website templates each deserve a portfolio-quality
demo URL — bookmarkable, shareable, looks "real". Forking the rr
repo per template = inherit 95% dead-weight infrastructure
(catalog page, CLI, MCP, 38 other layouts, `_shared/` utilities
not used by that template). Rejected — see [Operasi Mise alternative
proposals](./dashboard-vision.md).

**Solution:** wildcard subdomain rewriter. All 8 demos share one
Next.js deployment. `proxy.ts` inspects the `Host` header and
rewrites `demo-konsultan.rahmanef.com/` → `/preview/konsultan-os/public`.

**Sync property:** edit any template in rr → push to main → Dokploy
auto-rebuild → all 8 subdomains reflect the change in the next
request. Zero sync engine, zero webhook, zero cherry-pick.

## Architecture

```
Cloudflare wildcard DNS
        *.rahmanef.com  A   <dokploy-ip>   (proxied or DNS-only)
                   ↓
Dokploy custom domain on rr deployment
        *.rahmanef.com  →  rr Next.js container
                   ↓
Next.js proxy.ts inspects Host header
        host = "demo-X.rahmanef.com"
        ↓
        resolveDemoSlug(host) → slug
        ↓
        rewrite pathname to /preview/<slug>/<public|dashboard>/*
        ↓
        same React tree that resource.rahmanef.com/preview/<slug>/public renders
```

## SSOT files

| File | Purpose |
|---|---|
| `lib/content/template-subdomains.ts` | `SUBDOMAIN_TO_SLUG` map. Add a row here to publish a new demo URL. |
| `proxy.ts` | Host-based rewriter (root of repo, Next 16 convention). Reads the SSOT map. |

> **2026-06-19 (P7):** The `/layouts/<slug>` template-detail pages that used to
> surface the "Live demo" link are retired (the catalog is decommissioned; those
> routes 308-redirect to `/tour`). The `demo-*.rahmanef.com` subdomain rewriting
> in `proxy.ts` is UNCHANGED and still live — the demos are reached directly by
> their subdomain URL (and from `template-subdomains.ts` / `getDemoUrl(slug)`),
> not via an in-site detail page.

## Routing rules

| Visitor URL | Internal rewrite |
|---|---|
| `demo-konsultan.rahmanef.com/` | `/preview/konsultan-os/public` |
| `demo-konsultan.rahmanef.com/case-studies` | `/preview/konsultan-os/public/case-studies` |
| `demo-konsultan.rahmanef.com/admin` | `/preview/konsultan-os/dashboard/admin` |
| `demo-konsultan.rahmanef.com/admin/pages` | `/preview/konsultan-os/dashboard/admin/pages` |
| `demo-konsultan.rahmanef.com/_next/static/...` | NO rewrite (Next.js assets) |
| `demo-konsultan.rahmanef.com/api/knowledge` | NO rewrite (API stays accessible) |
| `demo-konsultan.rahmanef.com/favicon.ico` | NO rewrite |
| `rahmanef.com/*` | NO rewrite (personal site — different deployment, untouched) |
| `resource.rahmanef.com/*` | NO rewrite (rr canonical main site) |
| `*.rahmanef.com` not in map | NO rewrite (Next.js native 404) |

## Subdomain map (current 8 templates)

| Template slug | Subdomain |
|---|---|
| `personal-brand-os` | `demo-personal-branding.rahmanef.com` |
| `konsultan-os` | `demo-konsultan.rahmanef.com` |
| `kreator-studio-os` | `demo-kreator.rahmanef.com` |
| `wirausaha-os` | `demo-wirausaha.rahmanef.com` |
| `riset-kit` | `demo-riset.rahmanef.com` |
| `agency-studio-os` | `demo-agency.rahmanef.com` |
| `saas-marketing-os` | `demo-saas.rahmanef.com` |
| `notion-page-clone-os` | `demo-nosion.rahmanef.com` |

## Adding a new template demo URL

1. Add a row to `SUBDOMAIN_TO_SLUG` in `lib/content/template-subdomains.ts`:
   ```ts
   "demo-newslug": "new-template-os",
   ```
2. Push to main. Dokploy rebuilds. The new subdomain is live.
3. No DNS change needed (wildcard already covers it).

## Manual ops (one-time, then never again)

These are infrastructure-level changes Rahman must run once. The
subdomain plumbing in code is already done by the BR-wave commit.

### 1. Cloudflare DNS

Log into Cloudflare → `rahmanef.com` zone:

```
Type:   A
Name:   *
Value:  <DOKPLOY_IP>
Proxy:  Proxied (orange cloud) — handles SSL automatically
TTL:    Auto
```

If using Cloudflare Tunnel, point the wildcard CNAME to the tunnel
hostname instead.

### 2. Dokploy custom domain

Log into Dokploy → `resource-site` deployment → Domains:

```
Add domain:  *.rahmanef.com
Cert:        Let's Encrypt (DNS-01 challenge — Cloudflare API token needed)
             OR rely on Cloudflare proxy SSL (orange cloud)
```

Pick **Cloudflare proxy SSL** if the wildcard is proxied — simpler.
Pick **Let's Encrypt DNS-01** if you want origin certs.

### 3. Verify

```bash
# Each subdomain should return 200 OK with the template's public landing:
curl -I https://demo-konsultan.rahmanef.com/
curl -I https://demo-kreator.rahmanef.com/
curl -I https://demo-personal-branding.rahmanef.com/

# Admin surface accessible at /admin:
curl -I https://demo-konsultan.rahmanef.com/admin

# Main site untouched:
curl -I https://resource.rahmanef.com/
curl -I https://rahmanef.com/
```

## Cross-subdomain isolation

Each subdomain gets its own browser storage scope by default:

- **localStorage** — isolated per subdomain. Demo data persists
  per browser per subdomain. Reset = open in another subdomain or
  clear site data.
- **Cookies** — isolated unless explicitly scoped to
  `.rahmanef.com`. None of the demo code sets cross-domain cookies.
- **Convex auth** (if added later) — sessions per subdomain by
  default. Add `cookieDomain: ".rahmanef.com"` to share, but not
  recommended for demo isolation.

## What this does NOT solve

- **Per-subdomain SEO sitemap/robots** — currently all subdomains
  serve the same Next.js sitemap. Per-subdomain sitemap would
  require parameterizing the sitemap route or rewriting it like
  routes (deferred — low priority since these are demo URLs, not
  primary SEO surfaces).
- **Canonical URL meta tag** — visitor at `demo-X.rahmanef.com/`
  sees a page whose internal route is `/preview/X-os/public`. Add
  `<link rel="canonical">` per template-rendered page if SEO
  becomes a priority.
- **Real database backend** — demos use localStorage. Promoting one
  template to a real Convex backend is a separate decision (the
  `npx rr eject` CLI command, designed but not yet implemented).

## Related waves

- **BQ-wave (Operasi Mise M5)** — public taxonomy rename
  (Features → Modules). Set up the vocabulary this routing builds on.
- **BS-wave (next)** — sync notion-page-clone slice → admin-panel
  blocks. Original development queue resumed.
