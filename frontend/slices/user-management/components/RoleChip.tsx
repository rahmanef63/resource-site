// Inline role pill (local — the slice doesn't import rbac-roles' RoleBadge).
// Renders a RoleOption's name + color dot.

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { RoleOption } from "../types";

export function RoleChip({ role, className }: { role: RoleOption; className?: string }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
      {role.color ? (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
      ) : null}
      {role.name}
    </Badge>
  );
}
