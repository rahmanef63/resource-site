"use client";

import Link from "next/link";
import {
  Activity,
  Database,
  FileText,
  Layers,
  ListChecks,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "@/components/templates/notion-page-clone/shared/store";
import {
  ADMIN_BASE,
  PUBLIC_BASE,
} from "@/components/templates/notion-page-clone/shared/nav-config";

export default function Page() {
  const { state } = useStore();
  const totalDocs = state.docs.filter((d) => !d.rowOfDatabaseId && !d.trashed).length;
  const totalRows = state.docs.filter((d) => d.rowOfDatabaseId && !d.trashed).length;
  const totalDbs = state.databases.length;
  const totalSnippets = state.snippets.length;
  const publishedSnippets = state.snippets.filter((s) => s.published).length;
  const totalPages = state.pages.length;
  const enabledLanding = state.landingSections.filter((s) => s.enabled).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Nosion OS — Admin
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Workspace control surface. Snippets render on the{" "}
          <Link href={PUBLIC_BASE} className="underline">public landing</Link>; pages
          and databases are the editable workspace below.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card href={`${PUBLIC_BASE}/d/doc-welcome`} label="Pages" total={totalDocs}
                active={totalDocs} activeLabel="total" icon={FileText} />
          <Card href={`${PUBLIC_BASE}/db/db-roadmap`} label="Databases" total={totalDbs}
                active={totalRows} activeLabel="rows" icon={Database} />
          <Card href={`${ADMIN_BASE}/pages`} label="CMS pages" total={totalPages}
                active={enabledLanding} activeLabel="landing sections" icon={Layers} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Marketing
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card href={`${ADMIN_BASE}/snippets`} label="Snippets" total={totalSnippets}
                active={publishedSnippets} activeLabel="published" icon={Sparkles} />
          <Card href={`${ADMIN_BASE}/landing`} label="Landing sections" total={enabledLanding}
                active={enabledLanding} activeLabel="enabled" icon={ListChecks} />
          <Card href={`${ADMIN_BASE}/admin-panel/analytics`} label="Analytics" total={0}
                active={0} activeLabel="events tracked" icon={Activity} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Admin panel
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink href={`${ADMIN_BASE}/admin-panel/users`} title="Users & roles"
                     desc="Invite members, set roles, manage sessions." />
          <QuickLink href={`${ADMIN_BASE}/admin-panel/ai-config`} title="AI config"
                     desc="Model picker, system prompts, moderation rules." />
          <QuickLink href={`${ADMIN_BASE}/admin-panel/audit-log`} title="Audit log"
                     desc="Every mutation, diff-ready, filter by actor." />
          <QuickLink href={`${ADMIN_BASE}/admin-panel/webhooks`} title="Webhooks"
                     desc="Endpoint registry, delivery log, retry queue." />
          <QuickLink href={`${ADMIN_BASE}/admin-panel/settings`} title="Settings"
                     desc="Workspace identity, API keys, integrations." />
        </div>
      </section>
    </main>
  );
}

function Card({
  href, label, total, active, activeLabel, icon: Icon,
}: {
  href: string; label: string; total: number;
  active: number; activeLabel: string; icon: LucideIcon;
}) {
  return (
    <Link href={href} className="group block rounded-lg border border-border bg-card p-5 transition hover:bg-accent hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground/60 transition group-hover:text-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{total}</p>
      <p className="mt-1 text-xs text-muted-foreground">{active} {activeLabel}</p>
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group block rounded-lg border border-border bg-card p-4 transition hover:bg-accent">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
