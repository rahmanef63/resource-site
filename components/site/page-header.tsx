import * as React from "react";

/**
 * Canonical header for non-catalog docs pages — eyebrow → title → description.
 * Matches CatalogHero's responsive title treatment and shared readable line length
 * so content pages and catalog pages read as one family. Width + padding are
 * owned by DocsShell; this component never sets its own container.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  compact = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Single-row toolbar treatment for app-shell pages (/build) where a
   *  text-3xl stack would eat the viewport. Same content, bar layout. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }
  return (
    <header className="space-y-2.5">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">{title}</h1>
      {description && (
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {description}
        </p>
      )}
    </header>
  );
}
