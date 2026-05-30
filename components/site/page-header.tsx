import * as React from "react";

/**
 * Canonical header for non-catalog docs pages — eyebrow → title → description.
 * Matches CatalogHero's title treatment (`text-3xl font-bold tracking-tight`)
 * so content pages and catalog pages read as one family. Width + padding are
 * owned by DocsShell; this component never sets its own container.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {eyebrow && (
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-base text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
