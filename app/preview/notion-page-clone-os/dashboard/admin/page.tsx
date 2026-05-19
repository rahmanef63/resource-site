"use client";

import Link from "next/link";
import { useStore } from "@/components/templates/notion-page-clone/shared/store";
import { ADMIN_BASE, PUBLIC_BASE } from "@/components/templates/notion-page-clone/shared/nav-config";

export default function Page() {
  const { state } = useStore();
  const counts = {
    snippets: state.snippets.length,
    publishedSnippets: state.snippets.filter((s) => s.published).length,
    pages: state.pages.length,
    landing: state.landingSections.filter((s) => s.enabled).length,
  };
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Nosion OS — admin surface for the notion-blocks bundle demo. Snippets render on the{" "}
        <Link href={PUBLIC_BASE} className="underline">public landing</Link>.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card href={`${ADMIN_BASE}/snippets`} label="Snippets" total={counts.snippets} active={counts.publishedSnippets} activeLabel="published" />
        <Card href={`${ADMIN_BASE}/pages`} label="Pages" total={counts.pages} active={counts.pages} activeLabel="total" />
        <Card href={`${ADMIN_BASE}/landing`} label="Landing sections" total={counts.landing} active={counts.landing} activeLabel="enabled" />
      </div>
    </main>
  );
}

function Card({ href, label, total, active, activeLabel }: { href: string; label: string; total: number; active: number; activeLabel: string }) {
  return (
    <Link href={href} className="block rounded-lg border border-border bg-card p-5 transition hover:bg-accent">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{total}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {active} {activeLabel}
      </p>
    </Link>
  );
}
