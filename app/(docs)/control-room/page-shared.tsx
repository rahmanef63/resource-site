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
      <h2 className="text-2xl font-semibold tracking-tight">Deploy to a VPS — three paths</h2>
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

const REPO = "https://github.com/rahmanef63/control-room";

export function LocalInstall() {
  const local = [
    { label: "Any OS (npm)", cmd: "npx rahman-cr local" },
    {
      label: "Windows",
      cmd: "irm https://raw.githubusercontent.com/rahmanef63/control-room/main/install.ps1 | iex",
    },
    {
      label: "macOS / Linux",
      cmd: "curl -fsSL https://raw.githubusercontent.com/rahmanef63/control-room/main/install.sh | bash",
    },
  ];
  return (
    <Section
      eyebrow="No server? Start here"
      title="Local install — run it on your own machine"
      body={
        <>
          <p className="text-sm text-muted-foreground">
            Just trying it out, or running it on a single computer? Skip the VPS
            entirely. One command on Windows, macOS, or Linux — no SSH, Tailscale,
            or domain.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {local.map((l) => (
              <DocCard key={l.label} className="p-4">
                <p className="text-sm font-semibold">{l.label}</p>
                <code className="mt-2 block break-all rounded bg-muted px-2 py-1 font-mono text-[11px]">
                  {l.cmd}
                </code>
              </DocCard>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Then drive it with the <code className="font-mono text-xs">vps-cr</code>{" "}
            command: <code className="font-mono text-xs">vps-cr</code> to start,{" "}
            <code className="font-mono text-xs">vps-cr config</code> to set a
            password, <code className="font-mono text-xs">vps-cr doctor</code> to
            diagnose. Your first login is blocked until you approve the browser as a
            device — the dashboard shows an id; approve it once with{" "}
            <code className="font-mono text-xs">vps-cr acc &lt;device-id&gt;</code>.
          </p>
          <p className="text-sm">
            <ExtLink href={`${REPO}/blob/main/docs/INSTALL-LOCAL.md`}>
              Local install guide
            </ExtLink>{" "}
            ·{" "}
            <ExtLink href={`${REPO}/blob/main/docs/AI-ONBOARDING.md`}>
              AI onboarding playbook
            </ExtLink>
          </p>
        </>
      }
    />
  );
}
