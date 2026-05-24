import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate } from "@/components/templates/_shared/utils";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { SEED_ARTICLES } from "../../shared/insights-seed";
import type { Article } from "../../shared/types";

const TAG_TONE: Record<Article["tag"], string> = {
  Strategi: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  Operasi: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  Organisasi: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  Industri: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
};

export function InsightsListPage() {
  const sorted = [...SEED_ARTICLES].sort((a, b) => b.publishedAt - a.publishedAt);
  const [featured, ...rest] = sorted;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="Insights"
        title="Pemikiran tim kami"
        subtitle="Hasil refleksi dari engagement nyata. Sebagian besar artikel berasal dari pola yang berulang di klien kami."
      />

      <Link
        href={`${PUBLIC_BASE}/insights/${featured.slug}`}
        className="mt-12 block"
      >
        <Card className="group overflow-hidden border-border/60 bg-card/60 transition-colors hover:border-foreground/30">
          <div className="grid md:grid-cols-[1.4fr_1fr]">
            <CardContent className="space-y-4 p-8">
              <div className="flex items-center gap-2">
                <Badge className={`rounded-full text-[10px] ${TAG_TONE[featured.tag]}`}>
                  {featured.tag}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  Featured
                </Badge>
              </div>
              <h3 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                {featured.title}
              </h3>
              <p className="text-sm text-muted-foreground md:text-base">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {fmtDate(featured.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {featured.readMinutes} menit baca
                </span>
                <span>· {featured.author}</span>
              </div>
              <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5">
                Baca artikel <ArrowUpRight className="size-4" />
              </p>
            </CardContent>
            <div className="relative hidden bg-gradient-to-br from-foreground/[0.06] via-foreground/[0.02] to-transparent md:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl font-semibold text-foreground/10">
                  {featured.tag.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {rest.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`${PUBLIC_BASE}/insights/${article.slug}`} className="block">
      <Card className="group h-full border-border/60 bg-card/60 transition-colors hover:border-foreground/30">
        <CardContent className="flex h-full flex-col gap-3 p-6">
          <Badge className={`w-fit rounded-full text-[10px] ${TAG_TONE[article.tag]}`}>
            {article.tag}
          </Badge>
          <h3 className="text-lg font-medium leading-snug">{article.title}</h3>
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{article.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{fmtDate(article.publishedAt)}</span>
            <span>{article.readMinutes} menit</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
