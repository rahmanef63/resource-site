import { LayoutDashboard, BarChart3, Users, FileText, Settings, Bell, Search } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-[200px_1fr]">
        <aside className="border-r border-border/60 bg-muted/20 p-3">
          <div className="mb-4 px-2 text-sm font-semibold">Admin</div>
          <nav className="space-y-0.5 text-xs">
            {[
              { Icon: LayoutDashboard, label: "Dashboard", active: true },
              { Icon: BarChart3, label: "Analytics" },
              { Icon: Users, label: "Users" },
              { Icon: FileText, label: "Content" },
              { Icon: Bell, label: "Notifications" },
              { Icon: Settings, label: "Settings" },
            ].map(({ Icon, label, active }) => (
              <button key={label} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40"}`}>
                <Icon className="size-3.5" /> {label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-12 items-center justify-between border-b border-border/60 px-4">
            <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs">
              <Search className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Search…</span>
            </div>
            <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          </header>
          <div className="flex-1 space-y-4 p-6">
            <h1 className="text-xl font-bold">Welcome back</h1>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: "Revenue (MTD)", value: "$24,128", trend: "+18%" },
                { label: "Sign-ups", value: "342", trend: "+9%" },
                { label: "Churn", value: "1.8%", trend: "-0.4%" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-2 text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">{s.trend}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-lg border border-border/60 bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold">Revenue — last 14 days</h2>
                <div className="flex h-32 items-end gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/40" style={{ height: `${30 + (Math.sin(i * 1.3) + 1) * 35}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold">Top pages</h2>
                <div className="space-y-2 text-xs">
                  {[{ p: "/", v: "12.4k" }, { p: "/pricing", v: "8.1k" }, { p: "/blog/ship-mesh", v: "5.6k" }, { p: "/docs", v: "3.2k" }].map((r) => (
                    <div key={r.p} className="flex items-center justify-between border-b border-border/30 py-1.5 last:border-0">
                      <span className="font-mono">{r.p}</span>
                      <span className="text-muted-foreground">{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
