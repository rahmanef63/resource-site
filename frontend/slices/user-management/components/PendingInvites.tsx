"use client";

import { Mail, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RoleChip } from "./RoleChip";
import type { Invite, RoleOption, MembersLabels } from "../types";

interface Props {
  invites: Invite[];
  roles: RoleOption[];
  canModify: boolean;
  onCancel?: (i: { inviteId: string }) => void;
  onResend?: (i: { inviteId: string }) => void;
  labels: MembersLabels;
  className?: string;
}

function roleOf(slug: string, roles: RoleOption[]): RoleOption {
  return roles.find((r) => r.slug === slug) ?? { slug, name: slug };
}

export function PendingInvites({ invites, roles, canModify, onCancel, onResend, labels, className }: Props) {
  const pending = invites.filter((i) => i.status === "pending");
  if (!pending.length) return null;
  return (
    <div className={cn("rounded-lg border border-dashed", className)}>
      <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        {labels.pendingTitle} ({pending.length})
      </p>
      <ul className="divide-y">
        {pending.map((inv) => (
          <li key={inv.id} className="flex items-center gap-2 px-3 py-2">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{inv.email}</span>
            <RoleChip role={roleOf(inv.roleSlug, roles)} className="ml-1" />
            <span className="ml-auto text-xs text-muted-foreground">{labels.pending}</span>
            {canModify ? (
              <span className="flex items-center gap-0.5">
                {onResend ? (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                    aria-label={labels.resend} onClick={() => onResend({ inviteId: inv.id })}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                {onCancel ? (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    aria-label={labels.cancelInvite} onClick={() => onCancel({ inviteId: inv.id })}>
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
