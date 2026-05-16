import { ClipboardList, Filter, Download } from "lucide-react";

const LOGS = [
  { ts: "2026-05-16 12:04:18", actor: "alice@acme", role: "Owner", action: "role.assigned", target: "bob@acme → Admin", ip: "10.0.0.4" },
  { ts: "2026-05-16 11:58:02", actor: "system", role: "system", action: "rbac.seed", target: "workspace acme", ip: "—" },
  { ts: "2026-05-16 11:42:51", actor: "bob@acme", role: "Admin", action: "post.publish", target: "post-128", ip: "10.0.0.7" },
  { ts: "2026-05-16 11:18:33", actor: "alice@acme", role: "Owner", action: "billing.upgrade", target: "Pro → Scale", ip: "10.0.0.4" },
  { ts: "2026-05-16 10:47:09", actor: "carol@acme", role: "Editor", action: "post.draft", target: "post-129", ip: "10.0.0.12" },
  { ts: "2026-05-16 10:33:48", actor: "alice@acme", role: "Owner", action: "member.invite", target: "dave@new.io", ip: "10.0.0.4" },
  { ts: "2026-05-16 09:51:22", actor: "system", role: "system", action: "audit.export", target: "format=csv rows=412", ip: "—" },
];
const ROLE_COLOR: Record<string, string> = {
  Owner: "text-purple-500", Admin: "text-rose-500", Editor: "text-blue-500", system: "text-zinc-500",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><ClipboardList className="size-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Audit log</h1>
          <p className="text-xs text-muted-foreground">TenantAdapter-backed. Append-only, exportable.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 text-xs hover:bg-muted/40"><Filter className="size-3" /> Filter</button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 text-xs hover:bg-muted/40"><Download className="size-3" /> Export CSV</button>
        </div>
      </header>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="grid grid-cols-[1.6fr_1.4fr_1.4fr_2fr_0.8fr] border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Timestamp</div><div>Actor</div><div>Action</div><div>Target</div><div>IP</div>
        </div>
        <div className="divide-y divide-border/40">
          {LOGS.map((l, i) => (
            <div key={i} className="grid grid-cols-[1.6fr_1.4fr_1.4fr_2fr_0.8fr] items-center px-4 py-2.5 font-mono text-[11px] hover:bg-muted/20">
              <div className="text-muted-foreground">{l.ts}</div>
              <div>
                <span className="font-medium">{l.actor}</span>
                <span className={`ml-2 text-[10px] ${ROLE_COLOR[l.role] ?? "text-muted-foreground"}`}>·{l.role}</span>
              </div>
              <div className="text-foreground">{l.action}</div>
              <div className="truncate text-muted-foreground">{l.target}</div>
              <div className="text-muted-foreground">{l.ip}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
