import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type CtaButtonProps = {
  href: string;
  label: string;
};

export function CtaButton({ href, label }: CtaButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border-2 border-foreground rounded-md shadow-xs bg-foreground text-background px-6 py-3 text-xs uppercase tracking-brutal-sm font-medium hover:bg-background hover:text-foreground transition-colors"
    >
      {label} <ArrowUpRight className="w-4 h-4" />
    </Link>
  );
}
