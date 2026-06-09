# Deploy via si-coder + Dokploy

Zero-human-involvement deploy. Self-hosted Convex + Next.js in single docker-compose.

## rr's own Convex backend (api-resource.rahmanef.com)

The rr site's backend deploys **from this repo** — reproducible from
`git clone`, no hand-assembly:

- `convex/schema.ts` — root composer spreading every
  `convex/features/<slug>/_schema.ts` `<slugCamel>Tables` export
  (+ `authTables` / `authTablesExt`).
- `convex/crons.ts` — prune crons: `rateLimits` every 5 min,
  `newsletterSubscribeAttempts` + `subscriberAttempts` daily.

```bash
# .env.local (gitignored):
#   CONVEX_SELF_HOSTED_URL="https://api-resource.rahmanef.com"
#   CONVEX_SELF_HOSTED_ADMIN_KEY="..."  # docker exec <backend> ./generate_admin_key.sh
npm run deploy:convex            # stage-copy → codegen → deploy → cleanup
npm run deploy:convex -- --dry-run   # codegen sanity only
```

The script stages `convex/` into `.convex-deploy/` so the CLI's codegen
never touches the in-repo `convex/_generated` ambient stub (hard rule:
never codegen in-repo). Backend deployment env (`RATE_LIMIT_SERVER_KEY`)
lives on the deployment itself — `npx convex env list` with the same
`.env.local` sourced.

## Pre-flight

1. **Shell env** (`~/.bashrc`):
   ```bash
   export DOKPLOY_API_URL="https://dokploy.your-server.com"
   export DOKPLOY_API_KEY="..."
   export GITHUB_TOKEN="ghp_..."
   export HOSTINGER_API_TOKEN="..."   # optional, for DNS automation
   ```
2. **SSH key** for `git@github.com` configured.
3. **Generate `convex/_generated`** locally and **commit it**:
   ```bash
   cd template-base
   npx convex dev --once
   git add convex/_generated && git commit -m "chore: regenerate convex types"
   ```
   Audit-bp + si-coder both reject builds without committed `_generated`.
4. **Generate `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`** once and pin in Dokploy env:
   ```bash
   openssl rand -base64 32
   ```
   Required for Server Actions to work across rolling deploys (audit-bp P0).

## Deploy

```bash
cd template-base   # or your derived project
node $HOME/.agents/skills/si-coder/scripts/deploy.js \
  "$DOKPLOY_API_URL" "$DOKPLOY_API_KEY" \
  "<PROJECT_NAME>" "<APP_NAME>" \
  "$GITHUB_TOKEN" "<DOMAIN>"
```

The script:
1. Creates GitHub repo (`APP_NAME`).
2. Initializes git, commits, pushes via SSH.
3. Finds-or-creates Dokploy project `PROJECT_NAME`.
4. Detects `docker-compose.yml` → creates Dokploy Compose service.
5. Wires source → GitHub repo (PAT in URL).
6. Creates `DOMAIN` (idempotent — skips if exists).
7. If `HOSTINGER_API_TOKEN` set: adds A records for `DOMAIN`, `api-DOMAIN`, `dash-DOMAIN`, `site-DOMAIN`.
8. Triggers deploy + polls until success.

## docker-compose.yml services

| Service | Purpose | Ports |
|---|---|---|
| `app` | Next.js standalone | 3000 |
| `convex-backend` | Convex backend (Postgres) | 3210 (api), 3211 (site) |
| `convex-dashboard` | Convex admin UI | 6791 |
| `postgres` | Convex storage | (internal) |

Reverse proxy / TLS terminates at Dokploy's Traefik. Never expose ports directly.

## Audit-bp self-hosted gates (P0)

Required before first prod deploy:
- `POSTGRES_URL` set (no SQLite default in prod)
- `INSTANCE_SECRET` set + secret-managed
- `REDACT_LOGS_TO_CLIENT=true`
- TLS termination at proxy
- `convex/_generated` committed
- Backup-restore drill in last 30 days (`npx convex export` + `npx convex import --replace` documented)

## Hostinger DNS (auto)

If `HOSTINGER_API_TOKEN` present, deploy.js adds:
- `A DOMAIN → DOKPLOY_SERVER_IP`
- `A api-DOMAIN → DOKPLOY_SERVER_IP`
- `A dash-DOMAIN → DOKPLOY_SERVER_IP`
- `A site-DOMAIN → DOKPLOY_SERVER_IP`

Failures non-fatal — script logs and continues.

## Mandates (from si-coder skill)

1. **NO Clerk.** Always `@convex-dev/auth`.
2. **`npm install --yes --legacy-peer-deps`** to avoid prompts/peer hell.
3. **Commit `convex/_generated`** locally, NEVER run `convex codegen` inside Dockerfile.
4. **If template too bloated**, wipe and `npx create-next-app` fresh — do not fight TS errors.
5. **Dokploy idempotent**: existing apps/composes/domains are reused, never recreated.
