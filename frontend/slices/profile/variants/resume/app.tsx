"use client";

import {
  FileText, Mail, Globe, Link2, ArrowUpRight, Sparkles, Briefcase, Code2,
  MapPin, Printer, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumeProfile } from "./lib/host";
import { Section } from "./components/section";

// Pick a contact glyph from the href shape (no brand-specific icon mapping).
function contactIcon(href: string): LucideIcon {
  if (href.startsWith("mailto:")) return Mail;
  if (/^https?:/.test(href)) return Globe;
  return Link2;
}

// Default export so an os-shell can lazy-load this as a window app. Renders
// whatever profile the host injected via configureResume() — a generic
// placeholder person until then. The print:* utilities give a clean PDF when
// the viewer hits "Print / PDF" (window.print()).
export default function Resume() {
  const p = useResumeProfile();
  return (
    <ScrollArea className="h-full bg-card text-foreground">
      <div className="mx-auto max-w-2xl px-7 py-8 print:px-0 print:py-0">
        <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{p.roles.join(" · ")}</p>
            {p.location && (
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {p.location}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
              {p.contacts.map((c) => {
                const Icon = contactIcon(c.href);
                return (
                  <a
                    key={c.href}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="size-3.5" /> Print / PDF
          </Button>
        </header>

        <Section icon={FileText} title="Summary">
          <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
        </Section>

        <Section icon={Sparkles} title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <span key={s} className="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-xs">
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section icon={Briefcase} title="Experience">
          <div className="flex flex-col gap-4">
            {p.experience.map((e) => (
              <div key={`${e.org}-${e.role}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">
                    {e.role} · <span className="text-muted-foreground">{e.org}</span>
                  </h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{e.period}</span>
                </div>
                <ul className="mt-1.5 list-disc space-y-1 pl-4">
                  {e.points.map((pt) => (
                    <li key={pt} className="text-xs text-muted-foreground">{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Code2} title="Projects">
          <div className="flex flex-col gap-3">
            {p.projects.map((pr) => (
              <div key={pr.name} className="rounded-lg border border-border bg-card/60 p-3">
                <h3 className="truncate text-sm font-medium">{pr.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{pr.desc}</p>
                {pr.url && (
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {pr.url.replace(/^https?:\/\//, "")} <ArrowUpRight className="size-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </ScrollArea>
  );
}
