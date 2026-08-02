import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { DocCard } from "@/components/site/doc-primitives";
import { site } from "@/lib/content/site";
import { slices } from "@/lib/content/slices";

export const metadata = { title: "Introduction" };

export default function DocsIntroPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Documentation"
        title="Introduction"
        description={site.description}
      />

      <DocCard className="p-5">
        <h2 className="text-lg font-semibold">What's in the box</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">{slices.length} slices</span> —
            Tier-3 vertical slices (auth, editor, payments, AI router…) ported and audited.
          </li>
          <li>
            <span className="text-foreground font-medium">Install with Agent</span> — copyable
            prompts + JSON knowledge base so any AI agent (Claude / Codex / Cursor) can wire
            them into your repo.
          </li>
        </ul>
      </DocCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Installation", href: "/installation", desc: "Clone + install + first build." },
          { title: "Grand Tour", href: "/tour", desc: "Walk every act of the stack." },
          { title: "Slices", href: "/slices", desc: `${slices.length} vertical slices.` },
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
