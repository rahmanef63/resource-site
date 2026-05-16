import * as React from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TierCardProps = {
  name: string;
  blurb?: string;
  price: React.ReactNode;
  priceSuffix?: React.ReactNode;
  /** Optional strikethrough/original price line. */
  priceCompare?: React.ReactNode;
  features: string[];
  cta?: string;
  featured?: boolean;
  featuredLabel?: string;
  /** Render in stretched flex column — useful in 4-tier grids. */
  stretch?: boolean;
  className?: string;
  onCtaClick?: () => void;
};

/** Pricing tier card. Composes shadcn Card + Button + Badge.
 *  Used by every pricing-* preview so featured highlighting + spacing
 *  stays identical across variants. */
export function TierCard({
  name,
  blurb,
  price,
  priceSuffix = "/mo",
  priceCompare,
  features,
  cta = "Get started",
  featured = false,
  featuredLabel = "Most popular",
  stretch = false,
  className,
  onCtaClick,
}: TierCardProps) {
  return (
    <Card
      className={cn(
        "relative gap-0 p-6 sm:p-7",
        stretch && "flex flex-col",
        featured && "border-primary/50 bg-primary/[0.04] shadow-lg shadow-primary/10",
        className,
      )}
    >
      {featured && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-wider">
          {featuredLabel}
        </Badge>
      )}
      <h2 className="text-base font-semibold sm:text-lg">{name}</h2>
      {blurb && <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{blurb}</p>}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight sm:text-4xl">{price}</span>
        <span className="text-xs text-muted-foreground sm:text-sm">{priceSuffix}</span>
      </div>
      {priceCompare != null && (
        <p className="mt-1 text-xs text-muted-foreground line-through">{priceCompare}</p>
      )}
      <ul className={cn("mt-5 space-y-2 text-sm sm:mt-6 sm:space-y-2.5", stretch && "grow")}>
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500 sm:size-4" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={featured ? "default" : "outline"}
        className="mt-6 w-full sm:mt-7"
        onClick={onCtaClick}
      >
        {cta}
      </Button>
    </Card>
  );
}
