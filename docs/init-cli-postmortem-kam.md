# Init CLI Postmortem — `kam` build (2026-05-08)

Context: ran

```
npx rahman-resources@latest init kam \
  --template personal-brand-os \
  --features ai-sdk-openrouter,convex-auth,broadcast-channel-sync,convex-vector-search \
  --skills frontend-design,mcp-builder,webapp-testing,rahman-resources
```

Then deployed to Dokploy via si-coder skill at `karya.azzahrah.site` (self-hosted Convex).

Result: many manual fixes before site live. This doc lists each gap so future builders ship clean.

---

## 1. CLI scaffold gaps

### 1.1 `.gitignore` ships with `convex/_generated`
- Default ignore line: `convex/_generated`.
- Self-hosted Dokploy build runs `next build` inside Docker without Convex auth → can't regenerate. Must commit.
- Fix manual: remove line, regen, commit.
- **Action**: Drop `convex/_generated` from default `.gitignore`. Add doc note: self-hosted deploys MUST commit generated types.

### 1.2 `convex/_generated` not produced by init
- Init finishes without running codegen. Project won't typecheck or build.
- `npx convex dev --once` fails (needs auth).
- Workaround: `CONVEX_SELF_HOSTED_URL=http://localhost:3210 CONVEX_SELF_HOSTED_ADMIN_KEY="x|x" npx convex codegen --typecheck=disable`.
- **Action**: Init should run offline codegen (above pattern) before exit. Or ship pre-generated types in template.

### 1.3 `@auth/core` peer dep missing from `package.json`
- `@convex-dev/auth@0.0.84` peer-requires `@auth/core@^0.37.0`.
- Codegen + bundle errors: `Could not resolve "@auth/core"`.
- **Action**: Add `@auth/core@^0.37.0` to template `dependencies`.

### 1.4 shadcn UI components missing
- Templates import `badge, card, input, separator, sheet, textarea, tabs, dialog`. Only `button.tsx` shipped.
- Build fails `Cannot find module '@/components/ui/...'` (~50 errors).
- **Action**: Init should run `npx shadcn add` for every component referenced by chosen template. Or pre-ship the full set.

### 1.5 `@tabler/icons-react` not in deps
- Used by `_shared/ui/site-footer.tsx`. Not declared.
- **Action**: Add to template deps, or replace with `lucide-react` (already declared) for consistency.

---

## 2. Convex bundler trip hazards

### 2.1 `convex/templates/` lives inside `convex/`
- Convex bundler compiles every `.ts` in `convex/`. Template files import `./_generated/server` — `_generated` in template subdir doesn't exist. `npx convex deploy` fails.
- Fix manual: move to `convex-templates/` (outside bundle root).
- **Action**: Ship templates at `convex-templates/` or `cookbook/convex/`. Never inside the live `convex/` dir.

### 2.2 `convex/templates/personal-brand-os/*.ts` referenced by app code
- Some `app/preview/.../page.tsx` files imported these. Removing them breaks app.
- After move: those imports point to `convex-templates/...` — but app code shouldn't import scaffolds anyway.
- **Action**: Audit which `convex/templates/` files are referenced. If they're meant to be active, move to `convex/<feature>/`. If they're scaffolds, ensure no app import.

---

## 3. TypeScript strict failures in shipped templates

### 3.1 Implicit `any` in event handlers
- `components/templates/personal-brand/slices/**/*.tsx` has lots of `onChange={(e) => ...}` with no `e` type.
- 30+ `error TS7006` under `strict: true`.
- **Action**: Type all event handlers in template (`React.ChangeEvent<HTMLInputElement>` etc). Or set template-only relaxed tsconfig if intentional.

### 3.2 `tsconfig.json` doesn't exclude broken scaffolds
- Default includes `**/*.ts` — picks up `convex/templates/**` and `components/templates/**`.
- **Action**: Default `exclude` should list non-active scaffold dirs, OR scaffold dir naming convention (`*-templates`, `cookbook/`) should be auto-excluded.

---

## 4. Layout / routing mismatch

### 4.1 `rr.json` says `app/(public)` + `app/(admin)`, manifest puts content at `app/preview/<slug>/`
- Config promises route-group layout. Init delivers preview-style nesting.
- User expectation broke: visited `/` and saw placeholder, not template.
- **Action**: Pick one and align manifest + config + docs:
  - Option A: install AS preview at `app/preview/<slug>/` (current behavior). Update `rr.json` defaults to match. Add `init --promote` flag to move into `(public)` later.
  - Option B (recommended): install at `app/(public)/` + `app/admin/` immediately. `app/preview/` reserved for `npx rahman-resources preview <slug>` (sandbox without overriding root).

### 4.2 `(admin)` route group collides with `(public)` at root
- Both groups expose paths at `/`. `/portfolio/[id]` (admin) conflicts with `/portfolio/[slug]` (public).
- Fix manual: rename `app/(admin)` → `app/admin` (regular dir, not group).
- **Action**: Manifest should target `app/admin/` not `app/(admin)/` for templates that have admin routes overlapping public route names.

### 4.3 Hardcoded `/preview/<slug>/...` constants
- `nav-config.ts`: `PUBLIC_BASE = "/preview/personal-brand-os/public"`, `ADMIN_BASE = ".../admin"`.
- `app/robots.ts`, `app/sitemap.ts`: same.
- `site-config.ts`: `bookCallHref: "/preview/.../public/services"`.
- Promoting to root requires hand-editing all 4 files.
- **Action**: Constants should be derived from `rr.json` layout at codegen time, or be relative (`""` + `"/admin"`) and let layout supply prefix.

### 4.4 `site-config.ts` baseUrl hardcoded `https://lorem.dev`
- OG metadata, sitemap, robots all use it.
- **Action**: Read from `process.env.NEXT_PUBLIC_SITE_URL` with placeholder fallback. Or interpolate at init from `--domain` flag.

---

## 5. Next 16 + Convex provider SSG breakage

### 5.1 `cacheComponents: true` rejects `dynamic = "force-dynamic"`
- `next.config.mjs` has `cacheComponents: true`. Adding `export const dynamic` to layout fails build:
  > `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents.`
- **Action**: Document that escape hatches require `<Suspense>` boundary, not `dynamic` flag.

### 5.2 `ConvexAuthNextjsProvider` crashes during SSG
- Default `components/convex-provider.tsx` uses `ConvexAuthNextjsProvider`. Internals call `useConvexAuth()` during static prerender → `Cannot destructure property 'isLoading' of 'c(...)' as it is undefined`.
- Affects EVERY page that has the Provider in the tree.
- Fix manual: use `ConvexAuthProvider` from `@convex-dev/auth/react`, defer client init to `useEffect`, wrap in `<Suspense>`.
- **Action**: Ship the SSG-safe variant by default. Pattern (matches si-coder docs):

```tsx
"use client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";
import { useEffect, useState, type ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [convex] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return null;
    const client = new ConvexReactClient(url);
    const http = new ConvexHttpClient(url);
    const orig = client.action.bind(client);
    (client as any).action = (ref: any, args?: any) => {
      const name = (ref as any)?._name ?? String(ref);
      return typeof name === "string" && name.startsWith("auth:")
        ? http.action(ref, args)
        : orig(ref, args);
    };
    return client;
  });
  useEffect(() => setMounted(true), []);
  if (!mounted || !convex) return <>{children}</>;
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
```

And in `app/layout.tsx`:
```tsx
<Suspense fallback={null}>
  <ConvexClientProvider>{children}</ConvexClientProvider>
</Suspense>
```

### 5.3 `Math.random()` in Client Component without Suspense
- `cacheComponents` strict mode flags `new ConvexReactClient()` (uses `Math.random` for IDs internally) on `/_not-found`.
- Fixed by Suspense wrap above.

---

## 6. Dockerfile gaps for Dokploy

### 6.1 No Dockerfile shipped
- Template lacks Dockerfile + docker-compose.yml for self-hosted deploy.
- si-coder skill covers this externally, but if user deploys without skill, broken.
- **Action**: Ship reference `Dockerfile` + `docker-compose.yml` (compose can be marker-only since deploy skill uses Dokploy template "convex").

### 6.2 Stock Dockerfile pattern copies non-existent `public/`
- Common `COPY --from=builder /app/public ./public` fails because template doesn't ship `public/` dir.
- **Action**: Either ship empty `public/.gitkeep` OR omit the COPY in default Dockerfile.

### 6.3 `NEXT_PUBLIC_CONVEX_URL` must be real at build time, not dummy
- `NEXT_PUBLIC_*` is inlined into JS bundle by `next build`. Dummy URL = wrong WS endpoint = "Connection lost" runtime error.
- **Action**: Default Dockerfile should declare `ARG NEXT_PUBLIC_CONVEX_URL=https://api-<appname>.<domain>` and pass through to `ENV`. Document that domain must be known at init.

---

## 7. Self-hosted Convex env sync gotchas

### 7.1 Compose env ≠ Convex backend env
- si-coder writes `JWT_PRIVATE_KEY`, `JWKS` to Dokploy compose env. Backend container reads them as Docker env vars.
- BUT Convex *runtime* env (used by `process.env.JWT_PRIVATE_KEY` inside actions) is separate. Set via `npx convex env set` or REST `update_environment_variables`.
- After deploy, `list_environment_variables` returned `{}` even though compose env had keys. Auth would crash on first signIn.
- Fix manual:
  ```bash
  curl -X POST https://api-<app>.<domain>/api/update_environment_variables \
    -H "Authorization: Convex <ADMIN_KEY>" \
    -H "Content-Type: application/json" \
    --data '{"changes":[{"name":"JWT_PRIVATE_KEY","value":"..."},{"name":"JWKS","value":"..."},{"name":"SITE_URL","value":"..."}]}'
  ```
- **Action**: si-coder skill (and any deploy doc) must push these into the Convex backend runtime env, not just compose env. Add a verification step: `curl /api/list_environment_variables` after deploy and assert keys present.

### 7.2 JWKS served on `site-` subdomain, not `api-`
- `https://api-<app>/.well-known/jwks.json` → 404.
- `https://site-<app>/.well-known/jwks.json` → 200.
- `auth.config.ts` uses `process.env.CONVEX_SITE_URL` (mapped from `CONVEX_SITE_ORIGIN`) → correct site domain.
- **Action**: Document subdomain split clearly in `convex-patterns.md`. New devs assume `api-` serves everything.

### 7.3 `CONVEX_SITE_ORIGIN` / `CONVEX_CLOUD_ORIGIN` ↔ `CONVEX_SITE_URL` / `CONVEX_CLOUD_URL`
- Compose env uses `_ORIGIN` suffix. Convex functions read `_URL` suffix. Convex backend auto-maps.
- Subtle. Easy to set wrong key.
- **Action**: Doc table in `convex-patterns.md`.

---

## 8. Smaller paper cuts

- `app/icon.tsx` / `public/favicon.ico` not shipped → 404 on `/favicon.ico`.
- `.env.example` has empty `NEXT_PUBLIC_CONVEX_URL` placeholder. Init should fill in expected URL pattern when `--domain` flag passed.
- `app/page.tsx` ships placeholder "kam" landing — confusing because user installed full template. Should be deleted by init when `--template` provided (since template provides root via route groups).
- `convex/auth.ts` ships default `Password()` with stock Scrypt. On Dokploy proxy >60s timeouts kill it. Skill recommends PBKDF2/SHA-256 via WebCrypto. Ship that variant by default for self-hosted.
- `proxy.ts` is correct (Next 16). Good. Don't regress to `middleware.ts`.

---

## 9. Recommended init flow rewrite

```
npx rahman-resources init <name> --template <slug> --domain <fqdn> [--features ...] [--skills ...]
```

Init steps (target):

1. `npm install --legacy-peer-deps` — incl. `@auth/core`, `@tabler/icons-react`, all shadcn deps for chosen template.
2. `npx shadcn add <list-from-template-manifest>`.
3. Write template files to `app/(public)/` + `app/admin/` (not `app/preview/`).
4. Substitute `nav-config.ts`, `site-config.ts`, `robots.ts`, `sitemap.ts` placeholders with `<name>` and `<domain>`.
5. Generate Convex types offline: `CONVEX_SELF_HOSTED_URL=http://localhost:3210 CONVEX_SELF_HOSTED_ADMIN_KEY="x|x" npx convex codegen --typecheck=disable`.
6. Drop `convex/_generated` from `.gitignore`.
7. Ship `Dockerfile` + `docker-compose.yml` (marker) using known `--domain`.
8. Ship SSG-safe `ConvexClientProvider` (Suspense + client-only mount + HTTP routing for `auth:*`).
9. Print next steps: domain DNS, `si-coder` deploy command, env vars to set on backend (JWT/JWKS/SITE_URL).

---

## 10. Verification checklist for any new build

After init, before `git push`, verify:

- [ ] `npm run typecheck` → clean
- [ ] `npm run build` → clean (no prerender errors)
- [ ] `convex/_generated/` exists and is committed
- [ ] No `convex/templates/` (templates live outside `convex/`)
- [ ] `app/(public)/` or `app/admin/` populated (not `app/preview/`)
- [ ] `nav-config.ts` PUBLIC_BASE/ADMIN_BASE point to chosen routes
- [ ] `site-config.ts` baseUrl matches `--domain`
- [ ] `Dockerfile` builds locally: `docker build --build-arg NEXT_PUBLIC_CONVEX_URL=https://api-<app>.<domain> -t test .`
- [ ] After deploy: `curl https://api-<app>/api/list_environment_variables -H "Authorization: Convex <key>"` returns `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL`
- [ ] After deploy: `curl https://site-<app>/.well-known/jwks.json` returns valid JSON
- [ ] After deploy: visit `/` → template content (not placeholder), visit `/admin` → admin shell

---

Source: postmortem of `~/projects/kam` build deployed to `https://karya.azzahrah.site`. All fixes above were applied manually after init failed to ship clean.
