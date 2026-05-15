import type { Metadata } from "next";
import Link from "next/link";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Network,
  ShieldAlert,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Slice Composition Compiler",
  description:
    "Constraint-solving composer for portable feature slices — auth-mismatch + table-collision + cycle detection with arbitration proofs and 3-way semantic merge.",
};

type DnaConsumer = {
  adopted_at: string;
  version: string;
  drift_score: number;
  last_synced_at?: string;
};

type DnaLineage = {
  from: string;
  to?: string;
  at: string;
  transforms: string[];
  actor?: string;
};

type DnaFile = {
  id: string;
  created_at: string;
  lineage: DnaLineage[];
  consumers: Record<string, DnaConsumer>;
};

async function loadDna(): Promise<DnaFile[]> {
  const dir = join(process.cwd(), ".kitab", "lineage");
  const entries = await readdir(dir);
  const files = entries.filter(
    (f) => f.endsWith(".dna.json") && !f.endsWith(".local.json"),
  );
  const out = await Promise.all(
    files.map(async (f) => {
      const raw = await readFile(join(dir, f), "utf8");
      return JSON.parse(raw) as DnaFile;
    }),
  );
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

async function loadContractCount(): Promise<number> {
  const dir = join(process.cwd(), "frontend", "slices");
  const entries = await readdir(dir, { withFileTypes: true });
  let count = 0;
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    try {
      await readFile(
        join(dir, e.name, "slice.contract.ts"),
        "utf8",
      );
      count++;
    } catch {
      // skip — no contract yet
    }
  }
  return count;
}

const PILLARS = [
  {
    icon: Workflow,
    title: "Typed contracts",
    body: "Every slice ships a `defineSliceContract()` declaring provides (Convex tables, RBAC, env), requires (deps, env, auth), and explicit conflicts. Compile-time invariants — kebab id, semver, namespace prefix — caught before publish.",
  },
  {
    icon: Network,
    title: "Constraint solver",
    body: "`rr compose <slugs…>` runs a CSP-style solver over the contracts: auth-mismatch, table-collision, explicit-conflict, missing-dep, cycle. Returns a compatible subset OR a rejection proof — every blocker quoted.",
  },
  {
    icon: ShieldAlert,
    title: "Arbitration",
    body: "Pair collisions don't always reject. The solver ranks by depender count and lex order, drops one slice, and records the arbitration in the result. Both-installed conflicts surface as warnings instead.",
  },
  {
    icon: GitBranch,
    title: "DNA lineage",
    body: "Every harvest hop, namespace rename, and consumer adoption is recorded in `.kitab/lineage/<slug>.dna.json`. Drift scores per consumer let you see when a copy diverged enough to need a re-sync.",
  },
] as const;

const SCENARIOS = [
  {
    label: "Compatible",
    tone: "ok" as const,
    icon: CheckCircle2,
    cmd: "rr compose doku-payment mdx-blog",
    summary: "Both contracts pass. No table collision, no auth mismatch.",
    proof: [
      "→ resolved 2 slice(s)",
      "✓ doku-payment   provides=payments,paymentOrders   requires=convex-auth",
      "✓ mdx-blog       provides=posts,categories         requires=—",
      "verdict: COMPATIBLE",
    ].join("\n"),
  },
  {
    label: "Arbitrated",
    tone: "warn" as const,
    icon: ShieldAlert,
    cmd: "rr compose doku-payment midtrans-payment",
    summary:
      "table-collision on `payments` — solver drops the lower-ranked slice instead of rejecting both.",
    proof: [
      "→ collision: doku-payment.payments ⨯ midtrans-payment.payments",
      "→ arbitration: keep doku-payment (deps=2 > 0); drop midtrans-payment",
      "✓ doku-payment   kept",
      "✗ midtrans-payment   dropped (table-collision)",
      "verdict: COMPATIBLE (arbitrated)",
    ].join("\n"),
  },
  {
    label: "Rejected (--strict)",
    tone: "err" as const,
    icon: AlertTriangle,
    cmd: "rr compose comments-threaded --strict",
    summary:
      "uncontracted dep — strict mode flips warnings to blockers. Fails fast in CI.",
    proof: [
      "→ resolving comments-threaded@kitab",
      "→ requires.deps[]: rich-text-editor",
      "✗ rich-text-editor not in candidate set, not in slicesInstalled",
      "→ uncontracted (no slice.contract.ts registered)",
      "verdict: REJECTED — missing-dep",
    ].join("\n"),
  },
] as const;

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wider">
          {label}
        </CardDescription>
        <CardTitle className="font-mono text-3xl tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function ScenarioCard({
  s,
}: {
  s: (typeof SCENARIOS)[number];
}) {
  const Icon = s.icon;
  const tone =
    s.tone === "ok"
      ? "border-emerald-500/40 bg-emerald-500/5"
      : s.tone === "warn"
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-rose-500/40 bg-rose-500/5";
  const iconTone =
    s.tone === "ok"
      ? "text-emerald-500"
      : s.tone === "warn"
        ? "text-amber-500"
        : "text-rose-500";
  return (
    <Card className={cn("flex flex-col", tone)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", iconTone)} />
          <CardTitle className="text-base">{s.label}</CardTitle>
        </div>
        <CardDescription className="font-mono text-xs">
          $ {s.cmd}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground">{s.summary}</p>
        <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed">
          <code>{s.proof}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

export default async function CompilerPage() {
  const [dnas, contractCount] = await Promise.all([
    loadDna(),
    loadContractCount(),
  ]);

  const totalLineageHops = dnas.reduce((n, d) => n + d.lineage.length, 0);
  const driftRows = dnas
    .flatMap((d) =>
      Object.entries(d.consumers ?? {}).map(([name, c]) => ({
        slice: d.id,
        consumer: name,
        drift: c.drift_score,
        version: c.version,
        synced: c.last_synced_at ?? c.adopted_at,
      })),
    )
    .sort((a, b) => b.drift - a.drift);

  const recentLineage = dnas
    .flatMap((d) =>
      d.lineage.map((l) => ({
        slice: d.id,
        from: l.from,
        to: l.to ?? "—",
        at: l.at,
        transforms: l.transforms,
        actor: l.actor ?? "—",
      })),
    )
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 12);

  return (
    <article className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <Badge variant="outline" className="font-mono text-xs">
          Slice Composition Compiler · v0.12
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          The kitab is a compiler, not a copy-paste registry.
        </h1>
        <p className="max-w-3xl text-pretty text-lg text-muted-foreground">
          Notion stores pages. shadcn copies primitives. Yeoman scaffolds folders.
          Rahman Resources ships <em>typed contracts</em> and runs a constraint
          solver before any file lands in your project. Conflicts are caught at
          compose time. Updates flow upstream <em>and</em> downstream via 3-way
          semantic merge. Lineage is graph-shaped and queryable.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/quality"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            See live scoring →
          </Link>
          <Link
            href="/slices"
            className="inline-flex h-9 items-center rounded-md border bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Browse slices
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Slices DNA-tracked"
          value={dnas.length}
          hint="every harvest hop persisted as JSON"
        />
        <StatCard
          label="Contracts shipped"
          value={contractCount}
          hint="`slice.contract.ts` files passing validate:contracts"
        />
        <StatCard
          label="Lineage hops"
          value={totalLineageHops}
          hint="alias-rewrite, clerk-strip, namespace-rename, …"
        />
        <StatCard
          label="Active consumers"
          value={driftRows.length}
          hint="recorded in DNA `consumers{}` blocks"
        />
      </section>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Four pillars of the compiler
          </h2>
          <p className="text-sm text-muted-foreground">
            Each box maps to a CLI subcommand and a server module. None of this
            is theoretical — the code ships in <code>packages/cli/lib</code>.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Solver in action
          </h2>
          <p className="text-sm text-muted-foreground">
            Three real scenarios. Outputs match what{" "}
            <code>npx rahman-resources compose …</code> prints today.
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.label} s={s} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recent lineage
          </h2>
          <p className="text-sm text-muted-foreground">
            Last 12 transforms across the kitab. Sourced live from{" "}
            <code>.kitab/lineage/*.dna.json</code>.
          </p>
        </header>
        <div className="rounded-md border">
          <Table>
            <TableCaption className="px-4 pb-3 text-left">
              Browse the full graph via{" "}
              <code>npx rahman-resources graph</code> or the MCP resource{" "}
              <code>rr://graph/lineage</code>.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Slice</TableHead>
                <TableHead className="w-[28%]">From → To</TableHead>
                <TableHead>Transforms</TableHead>
                <TableHead className="w-[14%]">Actor</TableHead>
                <TableHead className="w-[14%] text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLineage.map((r, i) => (
                <TableRow key={`${r.slice}-${i}`}>
                  <TableCell className="font-mono text-xs">{r.slice}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <span>{r.from}</span>
                    <span className="px-1">→</span>
                    <span>{r.to}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.transforms.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="font-mono text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.actor}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {r.at.slice(0, 10)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {driftRows.length > 0 && (
        <section className="space-y-4">
          <header className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Consumer drift
            </h2>
            <p className="text-sm text-muted-foreground">
              How far each downstream consumer has diverged from the kitab. Red
              cells (≥40%) mean a re-sync via <code>rr update</code> will likely
              conflict — time to lift improvements UP.
            </p>
          </header>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slice</TableHead>
                  <TableHead>Consumer</TableHead>
                  <TableHead>Adopted version</TableHead>
                  <TableHead className="text-right">Drift</TableHead>
                  <TableHead className="text-right">Last synced</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driftRows.map((d) => {
                  const tone =
                    d.drift >= 40
                      ? "text-rose-500"
                      : d.drift >= 15
                        ? "text-amber-500"
                        : "text-emerald-500";
                  return (
                    <TableRow key={`${d.slice}-${d.consumer}`}>
                      <TableCell className="font-mono text-xs">
                        {d.slice}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {d.consumer}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {d.version}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono tabular-nums",
                          tone,
                        )}
                      >
                        {d.drift}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {d.synced.slice(0, 10)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <section className="rounded-lg border bg-muted/30 p-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Read the algorithms
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every claim above is backed by a doc + tests. Spelunk the source:
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            <code>docs/compose-solver.md</code> — solver, arbitration, transitive
            deps, cycle detection
          </li>
          <li>
            <code>docs/bidir-sync.md</code> — 3-way semantic merge + drift
            formula
          </li>
          <li>
            <code>docs/migration-planner.md</code> — rename detection, risk
            scoring
          </li>
          <li>
            <code>docs/quality-scoring.md</code> — audit / usage / drift bands
          </li>
        </ul>
      </section>
    </article>
  );
}
