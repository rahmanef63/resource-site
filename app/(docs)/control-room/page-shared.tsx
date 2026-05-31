import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DocCard } from "@/components/site/doc-primitives";

export function Section({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-3">{body}</div>
    </section>
  );
}

export function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
    >
      {children}
      <ExternalLink className="size-3" />
    </Link>
  );
}

export function PathMatrix() {
  const paths = [
    {
      icon: "🤖",
      label: "AI-assisted",
      command: "npx rahman-cr ai claude",
      time: "~20 min",
      best: "Walk through every step with Claude / Codex / Gemini",
    },
    {
      icon: "⚡",
      label: "One-line",
      command: "npx rahman-cr install --vps … --domain …",
      time: "~10 min",
      best: "All values ready, want minimum prompts",
    },
    {
      icon: "🛠️",
      label: "Manual",
      command: "See Phase 5 → C below",
      time: "~30 min",
      best: "Want to read each step before running it",
    },
  ];
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Three install paths</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {paths.map((p) => (
          <DocCard key={p.label} className="p-4">
            <p className="text-2xl">{p.icon}</p>
            <p className="mt-2 font-semibold">{p.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.time}</p>
            <code className="mt-3 block break-all rounded bg-muted px-2 py-1 font-mono text-[11px]">
              {p.command}
            </code>
            <p className="mt-3 text-xs text-muted-foreground">{p.best}</p>
          </DocCard>
        ))}
      </div>
    </section>
  );
}
