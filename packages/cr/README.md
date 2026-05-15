# @rahman/cr

> Installer for **VPS Control Room v2.0** — mobile-first PWA dashboard
> for driving a single VPS through a web browser.
> Repo: https://github.com/rahmanef63/control-room

## Quick use

```bash
# Option A — AI-assisted (Claude / Codex / Gemini)
npx @rahman/cr ai claude
# prints a structured prompt + copies it to clipboard → paste into your AI

# Option B — One-line non-interactive install
npx @rahman/cr install --vps user@1.2.3.4 --domain control.you.ts.net
# fresh VPS not on Tailscale yet? add --tailscale-key tskey-auth-XXXX

# Option C — Interactive wizard (asks A or B for you)
npx @rahman/cr init

# Verify local prereqs first
npx @rahman/cr doctor
```

## What the AI path does

`ai <provider>` prints a single self-contained prompt that:

1. **Anchors `/sc-all`** — if you're in Claude Code / Codex CLI / Gemini
   CLI with the skill installed, it auto-loads the zero-human deploy
   skill that handles GitHub + Dokploy + DNS phases.
2. **Lists every API endpoint** the AI may need:
   - Hostinger (DNS + VPS info)
   - Tailscale (auth key, devices, funnel)
   - Dokploy (app create + deploy + domain)
   - GitHub (repo create, deploy keys)
3. **Walks 7 phases** from prereqs to verify, asking for each value as
   it reaches that phase. No silent guesses.

The prompt is plain text and copied to your clipboard via `pbcopy` /
`wl-copy` / `xclip` / `xsel` / `clip.exe` (best-effort).

## What the one-line path does

`install --vps … --domain …` shells into the VPS over SSH and runs a
single heredoc that:

1. Installs `nvm` + Node 22.
2. (Optional) installs Tailscale and joins the tailnet with your key.
3. Clones the repo to `~/projects/vps-control-room`.
4. Generates two 32-byte hex secrets locally and writes `.env.local`
   on the VPS (chmod 600).
5. `npm install` for frontend + agent + cli.
6. Runs `scripts/install-systemd.sh` (sudo) and `scripts/deploy.sh main`.
7. Verifies both systemd services are active and `:4001/health`
   responds.

The login secret is printed **once** at the end. Save it in a password
manager.

## Required ahead of time

For Option B (one-line):
- SSH access to the VPS (`ssh-copy-id` your key first)
- Tailscale auth key, or the VPS already on your tailnet
- A tailnet domain (`<host>.<tailnet>.ts.net`) or custom DNS pointing
  at the Tailscale 100.x IP

For Option A (AI):
- Same as above, but the AI will ask for values as needed

## Flags (install command)

| Flag | Required | Default |
|------|----------|---------|
| `--vps user@host` | ✓ | — |
| `--domain fqdn` | ✓ | — |
| `--tailscale-key tskey-…` | — | skip Tailscale install |
| `--branch name` | — | `main` |
| `--repo url` | — | github.com/rahmanef63/control-room |
| `--dry-run` | — | print plan only |

## Security notes

- Secrets are generated on **your laptop**, transmitted **once over SSH**,
  and written to `.env.local` on the VPS with mode `600`.
- `.env.local` is gitignored in the upstream repo and stays gitignored.
- The dashboard is designed for **Tailscale-only** access. Do not
  expose `:4000` to the public internet.
- See [SECURITY.md](https://github.com/rahmanef63/control-room/blob/main/SECURITY.md)
  for the full threat model.

## License

MIT. See [LICENSE](https://github.com/rahmanef63/control-room/blob/main/LICENSE).
