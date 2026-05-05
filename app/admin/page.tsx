"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Box, ChefHat, FileCode, Layout, Settings } from "lucide-react";
import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";
import { sources } from "@/lib/content/sources";
import { useAdminState } from "@/lib/admin/storage";

const CARDS = [
  { label: "Site", href: "/admin/site", icon: Settings, desc: "Name, tagline, repo URL." },
  { label: "Layouts", href: "/admin/layouts", icon: Layout, desc: "Add/edit page shells." },
  { label: "Recipes", href: "/admin/recipes", icon: ChefHat, desc: "Add/edit feature drop-ins." },
  { label: "Sources", href: "/admin/sources", icon: Box, desc: "Source projects + attribution." },
  { label: "Export", href: "/admin/export", icon: FileCode, desc: "Generate TS files to commit." },
];

export default function AdminOverviewPage() {
  const [layoutsState] = useAdminState("layouts", layouts);
  const [recipesState] = useAdminState("recipes", recipes);
  const [sourcesState] = useAdminState("sources", sources);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Content editor</h1>
        <p className="mt-3 text-muted-foreground">
          Edit your kitab content in-browser. Nothing is sent to a server. When done, hit{" "}
          <Link href="/admin/export" className="underline underline-offset-2">Export</Link>{" "}
          to copy the updated TS files into <code className="font-mono text-xs">lib/content/</code>{" "}
          and commit.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-bold">{layoutsState.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Layouts</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-bold">{recipesState.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recipes</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-2xl font-bold">{sourcesState.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Sources</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="font-semibold">{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
