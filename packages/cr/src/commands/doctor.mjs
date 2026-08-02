import kleur from "kleur";
import { spawnSync } from "node:child_process";

export async function runDoctor() {
  console.log(kleur.bold("\nLocal prereqs check\n"));

  let fail = 0;
  fail += check("node", "node", ["-v"], (v) => semverAtLeast(v, 18));
  fail += check("npm", "npm", ["-v"]);
  fail += check("ssh", "ssh", ["-V"]);
  fail += check("openssl", "openssl", ["version"]);
  fail += check("git", "git", ["--version"]);

  console.log("");

  if (fail > 0) {
    console.log(kleur.red(`\n${fail} check(s) failed.`));
    process.exit(1);
  }

  console.log(kleur.green("All local prereqs OK."));
  console.log(
    kleur.gray(
      "\nNext: pick a path —\n  npx rahman-cr ai claude         (AI-assisted)\n  npx rahman-cr install --vps … --domain …  (one-line)",
    ),
  );
}

function check(label, cmd, args, predicate) {
  let r;
  try {
    r = spawnSync(cmd, args, { encoding: "utf8" });
  } catch {
    print(label, kleur.red("✖"), kleur.gray("(not in PATH)"));
    return 1;
  }
  if (r.status !== 0) {
    print(label, kleur.red("✖"), kleur.gray(r.stderr?.trim() || r.stdout?.trim() || "fail"));
    return 1;
  }
  const out = (r.stdout || r.stderr || "").trim().split("\n")[0];
  if (predicate && !predicate(out)) {
    print(label, kleur.yellow("△"), kleur.gray(`${out} — too old`));
    return 1;
  }
  print(label, kleur.green("✓"), kleur.gray(out));
  return 0;
}

function print(label, mark, info) {
  console.log("  ", mark, label.padEnd(10), info);
}

function semverAtLeast(versionStr, major) {
  const m = versionStr.match(/v?(\d+)\./);
  if (!m) return false;
  return Number(m[1]) >= major;
}
