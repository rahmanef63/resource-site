import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroCta = {
  href: string;
  label: string;
  /** "solid" = filled foreground bg; "outline" = bordered transparent. */
  variant?: "solid" | "outline";
};

export type HeroViewProps = {
  /** Small uppercase pill above the headline. */
  eyebrow?: string;
  /** Main display headline. */
  title: string;
  /** Pull-quote body copy (rendered italic, serif). */
  quote?: string;
  /** Primary + optional secondary buttons. */
  ctas?: HeroCta[];
  /** Right-column portrait. Pass null to render text-only. */
  image?: { src: string; alt: string };
  /** Small caption inside the image card (e.g. "FIG. 01 — name"). */
  imageCaption?: string;
};

export function HeroView({
  eyebrow,
  title,
  quote,
  ctas = [],
  image,
  imageCaption,
}: HeroViewProps) {
  return (
    <section className="relative py-12 md:py-20">
      <div className="container mx-auto px-6 grid gap-8 lg:grid-cols-12 lg:gap-12 lg:items-center">
        <div className={image ? "lg:col-span-7 space-y-6" : "lg:col-span-12 space-y-6"}>
          {eyebrow && (
            <span className="inline-block border-2 border-foreground rounded-sm px-3 py-1 text-[10px] uppercase tracking-widest font-medium">
              {eyebrow}
            </span>
          )}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight max-w-3xl">
            {title}
          </h1>
          {quote && (
            <p className="max-w-xl border-l-2 border-foreground pl-4 font-serif text-lg md:text-xl text-muted-foreground leading-relaxed italic">
              {quote}
            </p>
          )}
          {ctas.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {ctas.map((cta) => {
                const isOutline = cta.variant === "outline";
                const cls = isOutline
                  ? "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
                  : "border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground";
                return (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className={cn("inline-flex items-center gap-2 rounded-md shadow-xs px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors", cls)}
                  >
                    {cta.label} <ArrowUpRight className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {image && (
          <figure className="lg:col-span-5 relative border-2 border-foreground rounded-lg overflow-hidden bg-muted aspect-[4/5] lg:aspect-auto lg:h-[520px]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
            {imageCaption && (
              <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-2 border-2 border-foreground rounded-sm bg-background/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest font-medium">
                {imageCaption}
              </figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
}
