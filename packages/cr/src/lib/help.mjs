import kleur from "kleur";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = require(path.join(__dirname, "..", "..", "package.json"));

export function printVersion() {
  console.log(`${pkg.name} v${pkg.version}`);
}

export function printHelp() {
  console.log(`
${kleur.bold("rahman-cr")} — VPS Control Room installer

${kleur.bold("Usage")}
  ${kleur.cyan("npx rahman-cr")} <command> [options]

${kleur.bold("Commands")}
  ${kleur.green("init")}                    Interactive wizard — pick AI or one-line, walk through env
  ${kleur.green("ai")} <provider>           Print AI-assisted install prompt (claude | codex | gemini)
  ${kleur.green("install")} [flags]         Non-interactive one-line install on a target VPS
  ${kleur.green("doctor")}                  Verify local prereqs (Node, ssh, openssl)
  ${kleur.green("help")}                    Show this message
  ${kleur.green("version")}                 Print version

${kleur.bold("Install flags")}
  --vps <user@host>             SSH target (REQUIRED)
  --domain <fqdn>               Tailnet domain for the dashboard (REQUIRED)
  --tailscale-key <key>         tskey-… for tailscale up (OPTIONAL — skip if VPS already on tailnet)
  --branch <name>               Repo branch to deploy (default: main)
  --repo <url>                  Git repo url (default: github.com/rahmanef63/control-room)
  --dry-run                     Print plan, don't execute

${kleur.bold("Examples")}
  ${kleur.gray("# AI walks you through every step (paste prompt into Claude/Codex/Gemini)")}
  npx rahman-cr ai claude

  ${kleur.gray("# One-liner on a VPS you already SSH into and that's already on tailnet")}
  npx rahman-cr install --vps ubuntu@1.2.3.4 --domain control.you.ts.net

  ${kleur.gray("# Full one-liner with fresh Tailscale install")}
  npx rahman-cr install --vps ubuntu@1.2.3.4 --domain control.you.ts.net \\
    --tailscale-key tskey-auth-XXXX

${kleur.bold("Docs")}
  Step-by-step roadmap:  https://github.com/rahmanef63/control-room/blob/main/docs/INSTALL.md
  Threat model:          https://github.com/rahmanef63/control-room/blob/main/SECURITY.md
  Contribute:            https://github.com/rahmanef63/control-room/blob/main/CONTRIBUTING.md
`);
}
