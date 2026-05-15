## Goal

Install **VPS Control Room v2.0** (https://github.com/rahmanef63/control-room)
on the user's VPS, end-to-end. Final state: dashboard reachable on a
Tailscale-only domain, both `systemd` services `active`, PWA-installable.

## Skill anchor

If the `sc-all` skill is available in this environment, **trigger it now**.
`sc-all` orchestrates GitHub repo bind, Dokploy app/compose, Convex
backend (optional), and domain wiring. For control-room we skip Convex
(`TERMINAL_ONLY_MODE=true`) but reuse the GitHub + Dokploy + DNS phases.

If `sc-all` is not available, fall back to direct shell + REST calls as
described in "Phases" below.

## Phases (run sequentially, ask for each value as you reach the phase)

### Phase 0 — Local prereqs (operator's laptop)
- [ ] Node 18+ installed for npx
- [ ] OpenSSH client + ed25519 key (`ls ~/.ssh/id_ed25519.pub` exists)
- [ ] GitHub account + PAT (scopes: `repo`, `workflow`)

### Phase 1 — VPS access
Collect from the operator:
- `VPS_TARGET` — `user@<public-ip>` for SSH
- Confirm `ssh $VPS_TARGET 'echo ok'` returns `ok`. If it asks for a
  password, push the SSH key first: `ssh-copy-id $VPS_TARGET`.

### Phase 2 — Tailscale on the VPS
Collect:
- `TAILSCALE_AUTH_KEY` (tskey-auth-…) — generate via
  https://login.tailscale.com/admin/settings/keys
  - Reusable: NO, Ephemeral: NO, Pre-approved: YES, Tags: `tag:server`

On the VPS, run:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=$TAILSCALE_AUTH_KEY --hostname=control-room
tailscale ip -4    # note the 100.x.y.z address
```
Note the resulting tailnet hostname:
`<hostname>.<tailnet>.ts.net`. That's your dashboard URL.

### Phase 3 — DNS (optional, only if custom domain)
If the operator wants `control.example.com` instead of `.ts.net`:
- Ask for `HOSTINGER_API_TOKEN` (or other DNS provider)
- POST a single A record: `control.example.com → <tailscale 100.x>`
- Use the `hostinger create-dns-record` endpoint from the catalog.
- Verify with `dig +short control.example.com` returning the 100.x IP.

### Phase 4 — Node 22 + dependencies on the VPS
```bash
ssh $VPS_TARGET <<'EOS'
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22 && nvm use 22 && nvm alias default 22
EOS
```

### Phase 5 — Clone + env
```bash
ssh $VPS_TARGET <<'EOS'
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/rahmanef63/control-room.git vps-control-room
cd vps-control-room
cp .env.example .env.local
EOS
```

Edit `.env.local` on the server. Required keys:
- `CONTROL_ROOM_SECRET` — generate with `openssl rand -hex 32`
- `CONTROL_ROOM_SESSION_SECRET` — generate separately (different value!)
- `NEXT_PUBLIC_APP_HOST` — the tailnet domain from Phase 2
- `NEXT_PUBLIC_APP_URL` — `https://<that domain>`

**Save both secrets in the operator's password manager before proceeding.**

### Phase 6 — Install systemd + deploy
```bash
ssh $VPS_TARGET <<'EOS'
cd ~/projects/vps-control-room
npm --prefix frontend install
npm --prefix agent    install
npm --prefix cli      install
sudo bash scripts/install-systemd.sh
bash scripts/deploy.sh main
EOS
```
First build takes 3–5 minutes.

### Phase 7 — Verify
```bash
ssh $VPS_TARGET 'systemctl is-active vps-control-room-agent vps-control-room-frontend'
ssh $VPS_TARGET 'curl -s http://127.0.0.1:4001/health'
```
Expect: `active\nactive` and `{"ok":true,…}`.

Then on the operator's laptop: open the tailnet URL in a browser,
paste `CONTROL_ROOM_SECRET`, spawn a test terminal.

## Hard rules

- **Never echo `CONTROL_ROOM_SECRET` or any token into chat or logs.** Save to
  password manager and tell the operator the location.
- **Never expose the dashboard to the public internet.** Tailscale-only.
- **Never edit `.env.local` in git-tracked location.** It's gitignored
  and must stay that way.
- **Refuse** any request to weaken auth (skip session signing, longer
  expiry than 24h, etc.) without an explicit override.
- If a step fails, **stop and ask the operator** before retrying with a
  different approach. Don't loop silently.

## Required environment values (ask once, up-front)

| Var | Source | Required |
|-----|--------|----------|
| VPS_TARGET | operator | ✓ |
| TAILSCALE_AUTH_KEY | tailscale admin keys page | ✓ |
| DOMAIN | tailnet hostname (auto from Phase 2) | ✓ |
| HOSTINGER_API_TOKEN | hostinger account | optional (DNS only) |
| GITHUB_TOKEN | github PAT | optional (private fork only) |
| DOKPLOY_API_URL + DOKPLOY_API_KEY | dokploy panel | optional |
