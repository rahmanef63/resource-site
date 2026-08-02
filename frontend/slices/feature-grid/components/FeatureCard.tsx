import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FeatureCardProps = {
  title: string;
  body: string;
  icon?: LucideIcon | string;
  image?: { src: string; alt: string };
  link?: { label: string; href: string };
  /** Visual variant — matches FeatureGridSection layout. */
  variant?: "cards" | "minimal" | "alternating";
  /** Card content alignment. */
  align?: "left" | "center";
  className?: string;
};

function IconSlot({ icon }: { icon: FeatureCardProps["icon"] }) {
  if (!icon) return null;
  if (typeof icon === "string") {
    const letter = icon.trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        aria-hidden
        className="flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium text-muted-foreground"
      >
        {letter}
      </div>
    );
  }
  const Icon = icon;
  return (
    <div
      aria-hidden
      className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40 text-foreground"
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

export function FeatureCard({
  title,
  body,
  icon,
  image,
  link,
  variant = "cards",
  align = "left",
  className,
}: FeatureCardProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  const media = image ? (
    <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md border bg-muted">
      <Image src={image.src} alt={image.alt} fill className="object-cover" />
    </div>
  ) : null;

  const linkSlot = link ? (
    <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
      <Link href={link.href}>
        {link.label}
        <ArrowUpRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  ) : null;

  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col gap-3", alignClass, className)}>
        {media}
        <IconSlot icon={icon} />
        <h3 className="text-lg font-semibold leading-snug">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        {linkSlot}
      </div>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className={cn("flex flex-col gap-3", alignClass)}>
        {media}
        <IconSlot icon={icon} />
        <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">{body}</CardDescription>
      </CardHeader>
      {linkSlot ? (
        <CardContent className={cn("flex", align === "center" && "justify-center")}>
          {linkSlot}
        </CardContent>
      ) : null}
    </Card>
  );
}
