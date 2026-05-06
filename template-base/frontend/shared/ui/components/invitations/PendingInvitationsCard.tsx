"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format";
import {
  formatInvitationInviter,
  getInvitationInviterDisplayName,
} from "@/frontend/shared/lib/invitations/display";
import { useToast } from "@/hooks/use-toast";
import type { Id } from "@/convex/_generated/dataModel";

type PendingInvitationsCardProps = {
  className?: string;
  id?: string;
  title?: string;
  description?: string;
};

export function PendingInvitationsCard({
  className,
  id,
  title = "Pending Invitations",
  description = "You have pending invitations to join workspaces",
}: PendingInvitationsCardProps) {
  const { toast } = useToast();

  const rawInvitations = useQuery(api.workspace.invitations.getUserInvitations, {
    type: "received",
    status: "pending",
  });

  const invitations = rawInvitations?.filter((invitation: any) => invitation.status === "pending") ?? [];

  const acceptInvitation = useMutation(api.workspace.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.workspace.invitations.declineInvitation);

  const handleAccept = async (invitationId: Id<"invitations">) => {
    try {
      await acceptInvitation({ invitationId });
      toast({
        title: "Invitation Accepted",
        description: "You have joined the workspace.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (invitationId: Id<"invitations">) => {
    if (!confirm("Are you sure you want to decline this invitation?")) return;

    try {
      await declineInvitation({ invitationId });
      toast({
        title: "Invitation Declined",
        description: "The invitation has been declined.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to decline invitation",
        variant: "destructive",
      });
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card
      id={id}
      className={cn(
        "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Mail className="h-5 w-5 text-blue-600" />
            {title}
            <Badge
              variant="secondary"
              className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
            >
              {invitations.length}
            </Badge>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invitations.map((inv: any) => {
            const inviterDisplayName = getInvitationInviterDisplayName(inv);
            const inviterLabel = formatInvitationInviter(inv);

            return (
              <div
                key={inv._id}
                className="flex flex-col gap-4 rounded-lg border bg-background p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {inv.type === "workspace" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">
                      {inv.type === "workspace" ? (
                        <>
                          Invited to <span className="font-bold">{inv.workspace?.name ?? "a workspace"}</span> as{" "}
                          <span className="italic">{inv.role?.name ?? "Member"}</span>
                        </>
                      ) : (
                        <>
                          Friend request from <span className="font-bold">{inviterDisplayName}</span>
                        </>
                      )}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      From: {inviterLabel} • {formatRelativeTime(inv._creationTime)}
                    </p>
                    {inv.message ? (
                      <div className="mt-2 rounded bg-muted/50 p-2 text-xs italic text-muted-foreground">
                        "{inv.message}"
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={() => handleDecline(inv._id)}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => handleAccept(inv._id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
