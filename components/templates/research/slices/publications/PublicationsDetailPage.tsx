"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEED_PUBLICATIONS } from "../../shared/publications-seed";
import { PUBLIC_BASE } from "../../shared/nav-config";

function bibtexFor(slug: string) {
  const p = SEED_PUBLICATIONS.find((x) => x.slug === slug);
  if (!p) return "";
  const key = p.slug.replace(/-/g, "");
  return [
    `@${p.type === "conference" ? "inproceedings" : p.type === "report" ? "techreport" : "article"}{${key},`,
    `  author  = {${p.authors}},`,
    `  title   = {${p.title}},`,
    `  year    = {${p.year}},`,
    `  journal = {${p.venue}},`,
    p.pages ? `  pages   = {${p.pages}},` : "",
    `  doi     = {${p.doi}}`,
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

export function PublicationsDetailPage({ slug }: { slug: string }) {
  const pub = SEED_PUBLICATIONS.find((p) => p.slug === slug);
  if (!pub) notFound();

  const bibtex = React.useMemo(() => bibtexFor(slug), [slug]);

  function copyBib() {
    navigator.clipboard
      .writeText(bibtex)
      .then(() => toast.success("BibTeX disalin."))
      .catch(() => toast.error("Gagal menyalin."));
  }

  function copyDoi() {
    navigator.clipboard
      .writeText(pub!.doi)
      .then(() => toast.success("DOI disalin."))
      .catch(() => toast.error("Gagal menyalin."));
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`${PUBLIC_BASE}/publications`}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Kembali ke daftar
      </Link>

      <header className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{pub.year}</span>
          <Badge variant="outline" className="rounded-full text-[10px]">{pub.type}</Badge>
          <span>·</span>
          <span className="normal-case tracking-normal">{pub.venue}</span>
          {pub.pages && <span>· hal {pub.pages}</span>}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{pub.title}</h1>
        <p className="text-sm text-muted-foreground">{pub.authors}</p>
        <div className="flex flex-wrap gap-1.5">
          {pub.keywords.map((k) => (
            <Badge key={k} variant="outline" className="rounded-full text-[10px]">
              {k}
            </Badge>
          ))}
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Abstrak</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/85">{pub.abstract}</p>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {pub.pdfHref && (
          <Button asChild variant="outline" size="sm">
            <Link href={pub.pdfHref}>
              <Download className="size-3.5" /> PDF
            </Link>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={copyDoi}>
          <Copy className="size-3.5" /> DOI
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">
            doi.org <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>

      <section className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">BibTeX</h2>
          <Button variant="ghost" size="sm" onClick={copyBib} className="h-7 gap-1 text-xs">
            <Copy className="size-3" /> Salin
          </Button>
        </div>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-relaxed text-foreground/80">
{bibtex}
            </pre>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
