import { LayoutDashboard, Users, FileText, Mail, Settings, ShieldCheck, BarChart3, Bot, Image as ImageIcon, Webhook, KeyRound, Activity, Folder, Wrench, Bell, Boxes, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { Icon: LayoutDashboard, label: "Overview" },
  { Icon: Users, label: "Members" },
  { Icon: ShieldCheck, label: "Roles" },
  { Icon: FileText, label: "Content" },
  { Icon: ImageIcon, label: "Media" },
  { Icon: Mail, label: "Email" },
  { Icon: BarChart3, label: "Analytics" },
  { Icon: Bot, label: "AI" },
  { Icon: Database, label: "Database" },
  { Icon: Boxes, label: "Slices" },
  { Icon: Webhook, label: "Webhooks" },
  { Icon: KeyRound, label: "API keys" },
  { Icon: Activity, label: "Audit log" },
  { Icon: Folder, label: "Files" },
  { Icon: Bell, label: "Notifications" },
  { Icon: Wrench, label: "Settings" },
  { Icon: Settings, label: "Advanced" },
];

const STATS = [
  { label: "Active users", value: "1,247", change: "+12%" },
  { label: "Posts this week", value: "38", change: "+5%" },
  { label: "Avg session", value: "4m 12s", change: "+8%" },
  { label: "Errors (24h)", value: "7", change: "-23%" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-[220px_1fr]">
        <aside className="border-r border-border/60 bg-muted/20 p-3">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded bg-primary/15"><ShieldCheck className="size-4 text-primary" /></div>
            <span className="text-sm font-semibold">Admin</span>
          </div>
          <nav className="space-y-0.5">
            {SECTIONS.map(({ Icon, label }, i) => (
              <Button key={label} variant="ghost" type="button" className={`flex h-auto w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40"}`}>
                <Icon className="size-3.5" />
                {label}
              </Button>
            ))}
          </nav>
        </aside>
        <div className="p-6">
          <header className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold">Overview</h1>
              <p className="text-sm text-muted-foreground">17-section admin shell. RBAC-gated.</p>
            </div>
            <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs">acme.workspace</span>
          </header>
          <div className="mb-6 grid gap-3 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-lg border border-border/60 bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{s.change} vs last week</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-5">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            <div className="mt-3 space-y-2 text-xs">
              {["alice@acme published Post #247", "bob@acme invited 3 members", "system reseeded RBAC roles", "carol@acme exported 12 audit rows"].map((a) => (
                <div key={a} className="flex items-center gap-2 rounded border border-border/40 bg-muted/20 px-3 py-2">
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
