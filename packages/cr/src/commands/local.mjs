// Local install — run the whole Control Room on THIS machine (no VPS/SSH).
// Cross-platform (Windows / macOS / Linux): clones the repo, then delegates to
// the repo's own brain (scripts/local/control.mjs) for secrets + config, the
// same code the in-repo install.sh / install.ps1 one-liners use.

import kleur from "kleur";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";

const IS_WIN = platform() === "win32";
const NPM = IS_WIN ? "npm.cmd" : "npm";

// Install the `vps-cr` command so the user doesn't type long node paths —
// parity with the in-repo install.ps1 / install.sh.
function wireVpsCr(dir) {
  try {
    if (IS_WIN) {
      const ps = join(dir, "scripts", "win-local", "install-vps-cr-command.ps1");
      if (existsSync(ps)) {
        spawnSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps], { stdio: "inherit" });
      }
    } else {
      const src = join(dir, "bin", "vps-cr");
      if (existsSync(src)) {
        const binDir = join(homedir(), ".local", "bin");
        mkdirSync(binDir, { recursive: true });
        const dest = join(binDir, "vps-cr");
        try { rmSync(dest); } catch {}
        symlinkSync(src, dest);
        chmodSync(src, 0o755);
        console.log(kleur.green(`  linked ${dest}`));
        if (!(process.env.PATH || "").split(":").includes(binDir)) {
          console.log(kleur.yellow(`  add to PATH:  export PATH="$HOME/.local/bin:$PATH"  (in ~/.bashrc or ~/.zshrc)`));
        }
      }
    }
  } catch (e) {
    console.log(kleur.yellow(`  (could not auto-install vps-cr: ${e?.message ?? e} — run scripts/local/control.mjs directly)`));
  }
}

function parseFlags(args) {
  const out = {
    dir: join(homedir(), "vps-control-room"),
    repo: "https://github.com/rahmanef63/control-room.git",
    branch: "main",
    install: true,
    start: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dir") out.dir = args[++i];
    else if (a === "--repo") out.repo = args[++i];
    else if (a === "--branch") out.branch = args[++i];
    else if (a === "--no-install") out.install = false;
    else if (a === "--start") out.start = true;
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

function have(cmd) {
  try {
    return spawnSync(cmd, ["--version"], { stdio: "ignore" }).status === 0;
  } catch {
    return false;
  }
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited with code ${r.status}`);
}

export async function runLocal(args) {
  const f = parseFlags(args);
  const control = join(f.dir, "scripts", "local", "control.mjs");

  console.log(kleur.bold("\nVPS Control Room — LOCAL install\n"));
  console.log("  Target dir ", kleur.cyan(f.dir));
  console.log("  Repo       ", kleur.gray(`${f.repo} @ ${f.branch}`));
  console.log("  Runs entirely on this machine — no VPS, SSH, Tailscale, or domain.\n");

  if (f.dryRun) {
    console.log(kleur.gray("[dry-run] not executing."));
    return;
  }

  if (!have("node")) throw new Error("Node 18+ is required — https://nodejs.org/");
  if (!have("git")) throw new Error("git is required — https://git-scm.com/");

  if (existsSync(join(f.dir, ".git"))) {
    console.log(kleur.bold("→ Updating existing checkout"));
    run("git", ["-C", f.dir, "pull", "--ff-only"]);
  } else if (existsSync(f.dir)) {
    throw new Error(`Path exists but is not a git repo: ${f.dir} (use --dir to pick another)`);
  } else {
    console.log(kleur.bold("→ Cloning repo"));
    run("git", ["clone", "--branch", f.branch, f.repo, f.dir]);
  }

  console.log(kleur.bold("\n→ Writing .env.local (fresh secrets via node crypto)"));
  run("node", [control, "config", "--yes", "--no-install"], { cwd: f.dir });

  if (f.install) {
    console.log(kleur.bold("\n→ Installing deps (frontend + agent)"));
    run(NPM, ["--prefix", join(f.dir, "frontend"), "install", "--no-audit", "--no-fund"], { cwd: f.dir });
    run(NPM, ["--prefix", join(f.dir, "agent"), "install", "--no-audit", "--no-fund"], { cwd: f.dir });
  }

  console.log(kleur.bold("\n→ Installing the vps-cr command"));
  wireVpsCr(f.dir);

  if (f.start) {
    console.log(kleur.bold("\n→ Starting"));
    run("node", [control, "open"], { cwd: f.dir });
  }

  console.log(kleur.bold("\n✓ Local install complete\n"));
  console.log("  The config step above printed your " + kleur.bold("login password") + " — note it.");
  console.log("  Start it:       ", kleur.cyan("vps-cr") + kleur.gray("   (open a NEW terminal first so vps-cr loads)"));
  console.log("  Set a password: ", kleur.gray("vps-cr config"));
  console.log("  Health check:   ", kleur.gray("vps-cr doctor"));
  console.log(
    kleur.green("\n  Local installs auto-trust this machine — just log in with the password (no device approval)."),
  );
  console.log(kleur.gray("\n  Full guide: docs/INSTALL-LOCAL.md · AI playbook: docs/AI-ONBOARDING.md\n"));
}
