import * as React from "react";

export function DetailRow({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 border-b border-border/40 pb-2 last:border-0">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={mono ? "font-mono text-xs break-all" : "text-xs"}>
        {children}
      </div>
    </div>
  );
}
