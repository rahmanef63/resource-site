import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// One résumé section: an icon + title heading, then arbitrary body content.
export function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Icon className="size-4 text-primary" /> {title}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}
