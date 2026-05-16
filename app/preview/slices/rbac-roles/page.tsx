import { ShieldCheck, Check, Minus } from "lucide-react";

const ROLES = [
  { name: "Owner", color: "bg-purple-500/15 text-purple-600 dark:text-purple-300", users: 1 },
  { name: "Admin", color: "bg-rose-500/15 text-rose-600 dark:text-rose-300", users: 3 },
  { name: "Editor", color: "bg-blue-500/15 text-blue-600 dark:text-blue-300", users: 12 },
  { name: "Member", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300", users: 48 },
  { name: "Viewer", color: "bg-amber-500/15 text-amber-600 dark:text-amber-300", users: 17 },
  { name: "Guest", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300", users: 5 },
];
const PERMS = [
  { name: "Read", values: [true, true, true, true, true, true] },
  { name: "Comment", values: [true, true, true, true, true, false] },
  { name: "Write", values: [true, true, true, true, false, false] },
  { name: "Invite", values: [true, true, true, false, false, false] },
  { name: "Manage roles", values: [true, true, false, false, false, false] },
  { name: "Delete workspace", values: [true, false, false, false, false, false] },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><ShieldCheck className="size-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">RBAC Roles</h1>
          <p className="text-xs text-muted-foreground">6 system roles, permission matrix, workspace-isolated.</p>
        </div>
      </header>
      <div className="mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        {ROLES.map((r) => (
          <div key={r.name} className="rounded-lg border border-border/60 bg-card p-4">
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${r.color}`}>{r.name}</span>
            <p className="mt-3 text-2xl font-bold">{r.users}</p>
            <p className="text-[10px] text-muted-foreground">members</p>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Permission</div>
          {ROLES.map((r) => <div key={r.name} className="text-center">{r.name}</div>)}
        </div>
        {PERMS.map((p) => (
          <div key={p.name} className="grid grid-cols-7 border-b border-border/30 px-4 py-2 text-xs last:border-0">
            <div className="font-medium">{p.name}</div>
            {p.values.map((v, i) => (
              <div key={i} className="flex justify-center">{v ? <Check className="size-3.5 text-emerald-500" /> : <Minus className="size-3.5 text-muted-foreground/40" />}</div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
