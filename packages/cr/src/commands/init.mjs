// Interactive wizard — minimal, no inquirer dep. Uses readline.

import kleur from "kleur";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { runAi } from "./ai.mjs";
import { runInstall } from "./install.mjs";

export async function runInit() {
  const rl = readline.createInterface({ input, output });

  console.log(kleur.bold("\nVPS Control Room — installer wizard\n"));
  console.log(
    "Two ways to install:",
    "\n  ",
    kleur.cyan("1)"),
    "AI-assisted — paste a prompt into Claude / Codex / Gemini.",
    "\n  ",
    kleur.cyan("2)"),
    "One-line — non-interactive SSH install on a target VPS.",
    "\n",
  );

  const choice = (await rl.question(kleur.bold("Pick [1/2]: "))).trim();

  if (choice === "1") {
    const provider =
      (await rl.question(
        kleur.bold("Provider [claude/codex/gemini]: ") + kleur.gray("(claude) "),
      )).trim() || "claude";
    rl.close();
    await runAi([provider]);
    return;
  }

  if (choice === "2") {
    const vps = (await rl.question(kleur.bold("VPS target (user@host): "))).trim();
    const domain = (await rl.question(kleur.bold("Tailnet domain: "))).trim();
    const tailscaleKey = (
      await rl.question(
        kleur.bold("Tailscale auth key") + kleur.gray(" (empty if already on tailnet): "),
      )
    ).trim();
    rl.close();
    const flags = ["--vps", vps, "--domain", domain];
    if (tailscaleKey) flags.push("--tailscale-key", tailscaleKey);
    await runInstall(flags);
    return;
  }

  rl.close();
  console.error(kleur.red(`Unknown choice: ${choice}`));
  process.exit(1);
}
