import { Activity, MousePointer2, FileText, ShieldAlert, Sparkles, ShoppingCart, User } from "lucide-react";

const EVENTS = [
  { ts: "12:04:18", actor: "alice@acme", Icon: MousePointer2, name: "page.view", path: "/dashboard", color: "text-blue-500" },
  { ts: "12:04:11", actor: "system", Icon: Sparkles, name: "ai.suggestion.accepted", path: "task-42", color: "text-violet-500" },
  { ts: "12:04:03", actor: "bob@acme", Icon: FileText, name: "post.published", path: "post-128", color: "text-emerald-500" },
  { ts: "12:03:50", actor: "alice@acme", Icon: ShoppingCart, name: "checkout.completed", path: "$49.00", color: "text-amber-500" },
  { ts: "12:03:22", actor: "guest", Icon: User, name: "user.signup", path: "carol@new.io", color: "text-cyan-500" },
  { ts: "12:02:58", actor: "system", Icon: ShieldAlert, name: "auth.fail", path: "rate-limit", color: "text-rose-500" },
  { ts: "12:02:31", actor: "bob@acme", Icon: MousePointer2, name: "page.view", path: "/posts/edit", color: "text-blue-500" },
];

const STATS = [
  { label: "Events / min", value: "42" },
  { label: "Active sessions", value: "18" },
  { label: "p95 ingest", value: "12ms" },
  { label: "Retention", value: "90d" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6 flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><Activity className="size-5 text-primary" /></div>
        <div>
          <h1 className="text-xl font-bold">Event tracking</h1>
          <p className="text-xs text-muted-foreground">P0 instrumentation — captures every meaningful action.</p>
        </div>
      </header>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border/60 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold">Live event stream</h2>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
          </span>
        </div>
        <div className="divide-y divide-border/40">
          {EVENTS.map((e, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs">
              <span className="w-16 shrink-0 text-muted-foreground">{e.ts}</span>
              <e.Icon className={`size-3.5 shrink-0 ${e.color}`} />
              <span className="w-32 shrink-0 truncate text-muted-foreground">{e.actor}</span>
              <span className="w-44 shrink-0 font-medium">{e.name}</span>
              <span className="truncate text-muted-foreground">{e.path}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
