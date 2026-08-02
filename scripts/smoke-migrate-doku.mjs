// Synthetic Phase-E smoke test:
//
// Constructs a v0.9.0 doku-payment contract (pre-namespace) and diffs it
// against the on-disk v0.1.0. With `migrationFrom: { "0.9.0": "..." }` set
// on the new contract, the planner MUST emit `convex-schema-rename-table`
// steps — not destructive drop+add pairs.
//
// Run: node scripts/smoke-migrate-doku.mjs

import path from "node:path";
import { fileURLToPath } from "node:url";

import { diffContracts, planMigration } from "../packages/cli/lib/migration-plan.mjs";
import { loadSliceContract } from "../packages/cli/lib/load-contract.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Load the current contract from the folded slice.json (Phase-2 SSOT).
const toContract = loadSliceContract(path.join(repoRoot, "frontend", "slices", "doku-payment"));
if (!toContract) {
  process.stderr.write("Failed to load doku contract from slice.json\n");
  process.exit(1);
}

const fromContract = {
  id: "doku-payment",
  version: "0.9.0",
  requires: {
    auth: "convex",
    rbac: [
      "payment.create-order",
      "payment.view-order",
      "payment.cancel-order",
      "payment.refund",
      "payment.webhook-process",
    ],
    env: ["DOKU_CLIENT_ID", "DOKU_SECRET_KEY", "DOKU_IS_PRODUCTION", "DOKU_NOTIFY_PATH"],
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["paymentOrders", "paymentWebhookEvents"],
    routes: ["/checkout/doku"],
    hooks: ["useDokuCheckout"],
    events: ["payment.captured", "payment.failed", "payment.refunded"],
    components: ["DokuCheckoutButton", "DokuWebhookProbe"],
  },
};

const diff = diffContracts(fromContract, toContract);
const plan = planMigration(diff);

const head = `→ ${plan.slug}: v${plan.fromVersion} → v${plan.toVersion}`;
process.stdout.write(`\n${head}\n\n`);

const widths = [28, 28, 6, 4, 50];
const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+\n";
const row = (vals) =>
  "|" +
  vals
    .map((v, i) => " " + String(v).padEnd(widths[i]).slice(0, widths[i]) + " ")
    .join("|") +
  "|\n";

process.stdout.write(sep);
process.stdout.write(row(["id", "kind", "risk", "rev", "description"]));
process.stdout.write(sep);
for (const step of plan.steps) {
  process.stdout.write(
    row([
      step.id,
      step.kind,
      step.risk,
      step.reversible ? "yes" : "NO",
      step.description.replace(/\s+/g, " ").slice(0, widths[4]),
    ]),
  );
}
process.stdout.write(sep);

process.stdout.write(
  `\nsummary: ${plan.summary.totalSteps} step(s) — ` +
    `${plan.summary.highRisk} high-risk, ${plan.summary.irreversible} irreversible\n`,
);
if (plan.warnings.length) {
  process.stdout.write(`\nwarnings:\n`);
  for (const w of plan.warnings) process.stdout.write(`  ! ${w}\n`);
}

// Assertion: must include rename steps and zero drops.
const renames = plan.steps.filter((s) => s.kind === "convex-schema-rename-table");
const drops = plan.steps.filter((s) => s.kind === "convex-schema-drop-table");
if (renames.length !== 2 || drops.length !== 0) {
  process.stderr.write(
    `\nSmoke FAIL: expected 2 renames + 0 drops, got ${renames.length} renames + ${drops.length} drops.\n`,
  );
  process.exit(1);
}
process.stdout.write(`\nOK Smoke — rename detection paired both tables.\n`);
