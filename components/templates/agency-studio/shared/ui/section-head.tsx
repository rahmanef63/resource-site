import { cn } from "@/lib/utils";

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "", "max-w-3xl", className)}>
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted-foreground md:text-lg">{subtitle}</p>}
    </div>
  );
}
