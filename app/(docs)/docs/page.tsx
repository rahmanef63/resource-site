import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/content/site";
import { layouts } from "@/lib/content/layouts";
import { recipes } from "@/lib/content/recipes";

export const metadata = { title: "Introduction" };

export default function DocsIntroPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Documentation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Introduction</h1>
        <p className="mt-3 text-base text-muted-foreground">{site.description}</p>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-lg font-semibold">What's in the box</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">{layouts.length} layouts</span> —
            full app shells, dashboards, marketing sites you can copy and adapt.
          </li>
          <li>
            <span className="text-foreground font-medium">{recipes.length} recipes</span> —
            self-contained features (auth, editor, sidebar, contact form…) ported and audited.
          </li>
          <li>
            <span className="text-foreground font-medium">Install with Agent</span> — copyable
            prompts + JSON knowledge base so any AI agent (Claude / Codex / Cursor) can wire
            them into your repo.
          </li>
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Installation", href: "/installation", desc: "Clone + install + first build." },
          { title: "Layouts", href: "/layouts", desc: `${layouts.length} ready-to-copy shells.` },
          { title: "Recipes", href: "/recipes", desc: `${recipes.length} composable features.` },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{c.title}</h3>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
