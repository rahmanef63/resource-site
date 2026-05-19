"use client";

import * as React from "react";
import Link from "next/link";
import {
  EquationBlock,
  CodeBlock,
  NotifyMePopover,
} from "@/features/notion-blocks";
import { useSnippets } from "../../shared/store";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";

/** Public landing for Nosion-OS. Renders live demo of each notion-blocks
 *  primitive driven by admin-editable Snippet content. Plain markup —
 *  no per-template scaffolding needed beyond a Tailwind base. */
export function HomePage() {
  const snippets = useSnippets()
    .filter((s) => s.published)
    .sort((a, b) => a.order - b.order);
  const equations = snippets.filter((s) => s.kind === "equation");
  const codes = snippets.filter((s) => s.kind === "code");
  const texts = snippets.filter((s) => s.kind === "text");

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            {DEFAULT_SITE_CONFIG.productName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {DEFAULT_SITE_CONFIG.tagline}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {DEFAULT_SITE_CONFIG.description}
          </p>
        </div>
        <NotifyMePopover pageId="nosion-home" />
      </header>

      {texts.length > 0 && (
        <section className="mb-12 space-y-3">
          {texts.map((t) => (
            <p key={t.id} className="text-base text-foreground">
              {t.body}
            </p>
          ))}
        </section>
      )}

      {equations.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Equations
          </h2>
          <div className="grid gap-6 rounded-lg border border-border bg-card p-6">
            {equations.map((s) => (
              <ReadOnlyEquation key={s.id} title={s.title} latex={s.body} />
            ))}
          </div>
        </section>
      )}

      {codes.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Code snippets
          </h2>
          <div className="grid gap-6">
            {codes.map((s) => (
              <ReadOnlyCode key={s.id} title={s.title} lang={s.lang ?? "plaintext"} text={s.body} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Built with{" "}
        <Link href="/slices/notion-blocks" className="underline">
          notion-blocks
        </Link>
        . Manage content at{" "}
        <Link href={`${PUBLIC_BASE.replace("/public", "/admin")}/snippets`} className="underline">
          admin → snippets
        </Link>
        .
      </footer>
    </main>
  );
}

function ReadOnlyEquation({ title, latex }: { title: string; latex: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{title}</p>
      <EquationBlock text={latex} onText={() => {}} registerRef={() => {}} />
    </div>
  );
}

function ReadOnlyCode({ title, lang, text }: { title: string; lang: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{title}</p>
      <CodeBlock
        text={text}
        lang={lang}
        registerRef={() => {}}
        onText={() => {}}
        onLang={() => {}}
        onKeyDown={() => {}}
      />
    </div>
  );
}
