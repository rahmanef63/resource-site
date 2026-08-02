// Colored role pill. Pass a preset slug (color + name from ROLE_MAP) or a
// custom { name, color } for non-preset roles.

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ROLE_MAP, type RoleSlug } from "../lib/roles";

interface RoleBadgeProps {
  role: RoleSlug | { name: string; color?: string };
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const preset = typeof role === "string" ? ROLE_MAP.get(role) : undefined;
  const name = typeof role === "string" ? preset?.name ?? role : role.name;
  const color = typeof role === "string" ? preset?.color : role.color;
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
      {color ? (
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {name}
    </Badge>
  );
}
