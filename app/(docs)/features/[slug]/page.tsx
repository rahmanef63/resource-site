import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Box, Package } from "lucide-react";
import { features, getFeature } from "@/lib/content/features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/site/code-block";

export function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFeature(slug);
  return f ? { title: f.title, description: f.description } : { title: "Not found" };
}

export default async function FeatureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) return notFound();

  return (
    <article className="space-y-8 pb-16">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link href="/features"><ArrowLeft className="size-3.5" /> All features</Link>
      </Button>

      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full text-[10px] uppercase">{f.category}</Badge>
          {f.tags.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="rounded-full text-[10px]">{t}</Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{f.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{f.description}</p>
        {f.docsUrl && (
          <Button asChild variant="outline" size="sm" className="mt-4 gap-1">
            <a href={f.docsUrl} target="_blank" rel="noopener noreferrer">
              Official docs <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
        )}
      </header>

      <Separator />

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</p>
            </div>
            <p className="mt-2 break-words font-mono text-sm">{f.source}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Box className="size-4 text-muted-foreground" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dependencies</p>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {f.dependencies.map((d) => (
                <li key={d} className="font-mono text-xs">· {d}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Used by</p>
            </div>
            {f.usedBy && f.usedBy.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {f.usedBy.map((u) => (
                  <li key={u}>
                    <Link href={`/layouts/${u}`} className="font-mono text-xs hover:underline">
                      {u}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No template uses this yet.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Install</h2>
        <CodeBlock code={f.install} language="bash" filename="terminal" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Example</h2>
        <CodeBlock code={f.exampleCode} language="tsx" filename="example.tsx" />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Agent recipe</h2>
        <Card className="border-border/60 bg-muted/20">
          <CardContent className="p-5 text-sm leading-relaxed text-foreground/85">
            {f.agentRecipe}
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
