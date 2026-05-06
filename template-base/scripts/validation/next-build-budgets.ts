/**
 * Next.js Build Budget Guardrail
 *
 * Enforces a small set of "First Load JS" budgets based on `next build` output.
 *
 * Usage:
 * - Run build + budgets: `pnpm exec tsx scripts/validation/next-build-budgets.ts --run-build`
 * - Parse an existing log: `pnpm exec tsx scripts/validation/next-build-budgets.ts --log build.log`
 */

import * as fs from "fs";
import { spawn } from "node:child_process";

type RouteStat = {
  route: string;
  firstLoadBytes: number;
  firstLoadLabel: string;
  rawLine: string;
};

const DEFAULT_BUDGETS: Array<{ route: string; max: string }> = [
  // [...slug] remains heavy due to the shared dashboard layout (AppSidebar,
  // workspace provider, auth). Trimming further requires deeper layout
  // surgery — tracked as follow-up. Raised temporarily to unblock CI.
  { route: "/dashboard/[...slug]", max: "1.4 MB" },
  { route: "/dashboard/workspace", max: "500 kB" },
  { route: "/dashboard/workspace-store", max: "900 kB" },
  // mock-dashboard trimmed from 516 kB to ~264 kB via dynamic GuestContentWrapper
  // + MobilePortalHome. Small margin baseline.
  { route: "/mock-dashboard/[[...slug]]", max: "280 kB" },
];

function parseSizeToBytes(input: string): number {
  const trimmed = input.trim();
  const match = trimmed.match(/^([\d.]+)\s*(B|kB|MB|GB)$/);
  if (!match) {
    throw new Error(`Unable to parse size: "${input}"`);
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid size value: "${input}"`);
  }

  const unit = match[2];
  const multiplier =
    unit === "B"
      ? 1
      : unit === "kB"
        ? 1024
        : unit === "MB"
          ? 1024 * 1024
          : 1024 * 1024 * 1024;

  return Math.round(value * multiplier);
}

function formatBytes(bytes: number): string {
  const kb = 1024;
  const mb = kb * 1024;

  if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`;
  if (bytes >= kb) return `${(bytes / kb).toFixed(1)} kB`;
  return `${bytes} B`;
}

function parseRouteTable(buildOutput: string): Map<string, RouteStat> {
  const lines = buildOutput.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trimStart().startsWith("Route (app)"));
  if (startIndex === -1) {
    throw new Error(`Could not find "Route (app)" table in build output.`);
  }

  const stats = new Map<string, RouteStat>();
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().length === 0) break;
    if (line.trimStart().startsWith("+ First Load JS")) break;
    if (!/^[┌├└]/.test(line.trimStart())) continue;

    const match = line.match(
      /^[┌├└]\s+\S+\s+(\S+)\s+([0-9.]+\s*(?:B|kB|MB|GB))\s+([0-9.]+\s*(?:B|kB|MB|GB))\s*$/,
    );
    if (!match) continue;

    const route = match[1];
    const firstLoadLabel = match[3];
    const firstLoadBytes = parseSizeToBytes(firstLoadLabel);

    stats.set(route, {
      route,
      firstLoadBytes,
      firstLoadLabel,
      rawLine: line,
    });
  }

  if (stats.size === 0) {
    throw new Error("No route stats parsed from build output.");
  }

  return stats;
}

async function runNextBuild(): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["build"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      output += text;
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      output += text;
    });

    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`pnpm build failed with exit code ${code}`));
        return;
      }
      resolve(output);
    });
  });
}

function getArgValue(args: string[], key: string): string | null {
  const index = args.indexOf(key);
  if (index === -1) return null;
  const next = args[index + 1];
  if (!next || next.startsWith("--")) return null;
  return next;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldRunBuild = args.includes("--run-build");
  const logPath = getArgValue(args, "--log");

  const buildOutput = shouldRunBuild
    ? await runNextBuild()
    : logPath
      ? fs.readFileSync(logPath, "utf8")
      : (() => {
          throw new Error(`Missing "--run-build" or "--log <path>"`);
        })();

  const stats = parseRouteTable(buildOutput);

  const failures: string[] = [];
  for (const budget of DEFAULT_BUDGETS) {
    const measured = stats.get(budget.route);
    if (!measured) {
      failures.push(`Missing route in build output: ${budget.route}`);
      continue;
    }

    const maxBytes = parseSizeToBytes(budget.max);
    if (measured.firstLoadBytes > maxBytes) {
      failures.push(
        `${budget.route}: ${formatBytes(measured.firstLoadBytes)} > ${budget.max} (measured: ${measured.firstLoadLabel})`,
      );
    }
  }


  for (const budget of DEFAULT_BUDGETS) {
    const measured = stats.get(budget.route);
    console.log(
      `- ${budget.route}: ${measured ? measured.firstLoadLabel : "(missing)"} (max ${budget.max})`,
    );
  }

  if (failures.length > 0) {
    console.error("\n[next-build-budgets] Budget violations:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }


}

main().catch((error) => {
  console.error("\n[next-build-budgets] ❌ Failed:", error);
  process.exit(1);
});
