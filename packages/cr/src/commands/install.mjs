// One-line non-interactive install over SSH.
// Spawns ssh with a single heredoc that does everything on the VPS.

import kleur from "kleur";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";

function parseFlags(args) {
  const out = { branch: "main", repo: "https://github.com/rahmanef63/control-room.git" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--vps") out.vps = args[++i];
    else if (a === "--domain") out.domain = args[++i];
    else if (a === "--tailscale-key") out.tailscaleKey = args[++i];
    else if (a === "--branch") out.branch = args[++i];
    else if (a === "--repo") out.repo = args[++i];
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

export async function runInstall(args) {
  const f = parseFlags(args);

  if (!f.vps || !f.domain) {
    console.error(kleur.red("--vps and --domain are required"));
    console.error("Example: npx @rahman/cr install --vps ubuntu@1.2.3.4 --domain control.you.ts.net");
    process.exit(1);
  }

  const secret = randomBytes(32).toString("hex");
  const sessionSecret = randomBytes(32).toString("hex");

  console.log(kleur.bold("\nPlan\n"));
  console.log("  VPS target  ", kleur.cyan(f.vps));
  console.log("  Domain      ", kleur.cyan(f.domain));
  console.log("  Repo        ", kleur.gray(f.repo));
  console.log("  Branch      ", kleur.gray(f.branch));
  console.log(
    "  Tailscale   ",
    f.tailscaleKey ? kleur.green("install + up with provided key") : kleur.gray("skip (assumed already on tailnet)"),
  );
  console.log("\n  Secrets will be generated on this machine and written to .env.local on the VPS.");
  console.log(kleur.yellow("  → save the login secret printed at the end in your password manager.\n"));

  if (f.dryRun) {
    console.log(kleur.gray("[dry-run] not executing."));
    return;
  }

  const script = buildRemoteScript({
    domain: f.domain,
    repo: f.repo,
    branch: f.branch,
    tailscaleKey: f.tailscaleKey,
    secret,
    sessionSecret,
  });

  console.log(kleur.bold("Executing remote install…\n"));
  const r = spawnSync("ssh", ["-o", "StrictHostKeyChecking=accept-new", f.vps, "bash -s"], {
    input: script,
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (r.status !== 0) {
    console.error(kleur.red(`\nssh exited with code ${r.status}`));
    process.exit(r.status ?? 1);
  }

  console.log(kleur.bold("\n✓ Install complete\n"));
  console.log("  URL        ", kleur.cyan(`https://${f.domain}`));
  console.log("  Login key  ", kleur.green(secret));
  console.log(
    kleur.yellow("\n  Save the login key in your password manager NOW. It will not be shown again."),
  );
}

function buildRemoteScript(opts) {
  const tailscaleBlock = opts.tailscaleKey
    ? `
echo "[tailscale] installing..."
if ! command -v tailscale >/dev/null 2>&1; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
sudo tailscale up --authkey='${opts.tailscaleKey.replace(/'/g, "'\\''")}' --hostname=control-room
`
    : "echo '[tailscale] skipped — assuming already on tailnet'";

  return `set -euo pipefail

export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "[nvm] installing..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install 22 >/dev/null
nvm use 22 >/dev/null
nvm alias default 22 >/dev/null
echo "[node] $(node -v)"

${tailscaleBlock}

mkdir -p "$HOME/projects"
cd "$HOME/projects"
if [ ! -d vps-control-room ]; then
  git clone --branch '${opts.branch}' '${opts.repo}' vps-control-room
fi
cd vps-control-room
git fetch origin
git reset --hard origin/${opts.branch}

cat > .env.local <<'ENVEOF'
CONTROL_ROOM_SECRET=${opts.secret}
CONTROL_ROOM_SESSION_SECRET=${opts.sessionSecret}
SESSION_EXPIRY_HOURS=24
TERMINAL_ONLY_MODE=true
CONTROL_ROOM_PORT=4000
AGENT_HEALTH_PORT=4001
NEXT_PUBLIC_APP_URL=https://${opts.domain}
NEXT_PUBLIC_APP_HOST=${opts.domain}
ENVEOF
chmod 600 .env.local

npm --prefix frontend install --no-audit --no-fund
npm --prefix agent    install --no-audit --no-fund
npm --prefix cli      install --no-audit --no-fund

sudo bash scripts/install-systemd.sh
bash scripts/deploy.sh ${opts.branch}

systemctl is-active vps-control-room-agent
systemctl is-active vps-control-room-frontend
curl -fsS http://127.0.0.1:4001/health
`;
}
