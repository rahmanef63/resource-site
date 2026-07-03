"use client";

import { Mail, Link2, ArrowUpRight, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAboutProfile, type AboutLink } from "./lib/host";
import { FaqList } from "./components/faq-list";

// Default export so an os-shell can lazy-load this as a window app. The whole
// card is driven by the injected profile (host seam) — mock until configured.
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function LinkRow({ label, href }: AboutLink) {
  const Icon = href.startsWith("mailto:") ? Mail : Link2;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
    >
      <Icon className="size-4 shrink-0 text-primary" />
      <span className="truncate">{label}</span>
      <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

export default function AboutProfile() {
  const p = useAboutProfile();
  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="flex flex-col items-center px-6 py-8 text-center">
        <Avatar className="size-20 rounded-3xl shadow-lg">
          {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
          <AvatarFallback className="rounded-3xl bg-primary text-2xl font-semibold text-primary-foreground">
            {initials(p.name)}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{p.name}</h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">{p.roles.join(" · ")}</p>
        {p.location ? (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> {p.location}
          </p>
        ) : null}

        <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">{p.description}</p>

        {p.links.length > 0 ? (
          <div className="mt-6 flex w-full max-w-sm flex-col gap-2 text-left">
            {p.links.map((l) => (
              <LinkRow key={l.href} {...l} />
            ))}
          </div>
        ) : null}

        {p.faq.length > 0 ? (
          <div className="mt-6 w-full max-w-sm text-left">
            <h2 className="mb-2 text-sm font-semibold">FAQ</h2>
            <FaqList items={p.faq} />
          </div>
        ) : null}
      </div>
    </ScrollArea>
  );
}
