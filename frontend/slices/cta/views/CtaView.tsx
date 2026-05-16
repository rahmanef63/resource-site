import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type CtaViewProps = {
  /** Small uppercase label above the heading. */
  eyebrow: string;
  /** Main headline. */
  title: string;
  /** Supporting paragraph below the headline. */
  body: string;
  /** Anchor target for the action button. */
  href: string;
  /** Action button label. */
  ctaLabel: string;
};

export function CtaView({
  eyebrow,
  title,
  body,
  href,
  ctaLabel,
}: CtaViewProps) {
  return (
    <section className="bg-foreground text-background">
      <div className="px-6 py-16 md:p-16 lg:p-24 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <span className="inline-block border-2 border-background px-3 py-1 text-[10px] uppercase tracking-brutal font-medium">
            {eyebrow}
          </span>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl lg:text-7xl leading-tight">
            {title}
          </h2>
          <p className="mt-6 max-w-2xl text-sm md:text-base text-background/70 leading-relaxed">
            {body}
          </p>
        </div>
        <div className="lg:col-span-4 flex lg:justify-end">
          <Link
            href={href}
            className="inline-flex items-center gap-3 border-2 border-background bg-background text-foreground px-8 py-4 text-sm uppercase tracking-brutal-sm font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            {ctaLabel} <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
