import { ShieldCheck, Building2, ArrowUpRight, Activity, Database } from "lucide-react";

const TENANTS = [
  { name: "acme.com", plan: "Scale", users: 124, mrr: "$4,900", status: "healthy" },
  { name: "globex.io", plan: "Team", users: 18, mrr: "$580", status: "healthy" },
  { name: "initech.dev", plan: "Pro", users: 8, mrr: "$190", status: "trial" },
  { name: "umbrella.co", plan: "Team", users: 42, mrr: "$1,440", status: "warning" },
  { name: "soylent.app", plan: "Pro", users: 5, mrr: "$95", status: "healthy" },
  { name: "wonka.cloud", plan: "Free", users: 1, mrr: "$0", status: "healthy" },
];
const STATUS = {
  healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  trial: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-rose-500/15"><ShieldCheck className="size-5 text-rose-500" /></div>
        <div>
          <h1 className="text-xl font-bold">Platform admin</h1>
          <p className="text-xs text-muted-foreground">Cross-tenant operator console. Multi-workspace, padmin-gated.</p>
        </div>
        <span className="ml-auto rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-300">SUPERADMIN</span>
      </header>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          { Icon: Building2, label: "Tenants", v: "6" },
          { Icon: ArrowUpRight, label: "MRR", v: "$7.2k" },
          { Icon: Activity, label: "Healthy", v: "5 / 6" },
          { Icon: Database, label: "Storage", v: "428 GB" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.Icon className="size-3.5 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Tenant</div><div>Plan</div><div>Users</div><div>MRR</div><div>Status</div>
        </div>
        <div className="divide-y divide-border/40">
          {TENANTS.map((t) => (
            <div key={t.name} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-4 py-3 text-sm hover:bg-muted/20">
              <div className="font-mono font-medium">{t.name}</div>
              <div className="text-xs">{t.plan}</div>
              <div className="text-xs">{t.users}</div>
              <div className="text-xs tabular-nums">{t.mrr}</div>
              <div><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS[t.status as keyof typeof STATUS]}`}>{t.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
