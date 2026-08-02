/** Status badge for slices + templates. Single component handles every
 *  enum value from both Maturity (slices) and LayoutStatus (templates).
 *  Defaults to "stable" → no badge rendered, since stable is the silent
 *  default (showing it everywhere would be noise). */

import { Badge } from "@/components/ui/badge";

export type StatusKind =
  | "stable" | "beta" | "wip" | "draft" | "experimental" | "deprecated"
  | "coming-soon";

const META: Record<Exclude<StatusKind, "stable">, { label: string; className: string }> = {
  beta: {
    label: "Beta",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  wip: {
    label: "In develop",
    className: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  },
  draft: {
    label: "Draft",
    className: "bg-zinc-500/15 text-zinc-400 border border-zinc-500/30",
  },
  experimental: {
    label: "Experimental",
    className: "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30",
  },
  deprecated: {
    label: "Deprecated",
    className: "bg-red-500/15 text-red-400 border border-red-500/30 line-through decoration-red-500/40",
  },
  "coming-soon": {
    label: "Coming soon",
    className: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
  },
};

export function MaturityBadge({
  status,
  className,
}: {
  status?: StatusKind;
  className?: string;
}) {
  if (!status || status === "stable") return null;
  const meta = META[status];
  if (!meta) return null;
  return (
    <Badge className={`rounded-full text-[10px] ${meta.className} ${className ?? ""}`}>
      {meta.label}
    </Badge>
  );
}
