"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check, X, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format";
import { useToast } from "@/hooks/use-toast";
import type { Id } from "@/convex/_generated/dataModel";

type PendingContactRequestsCardProps = {
  className?: string;
  id?: string;
  title?: string;
  description?: string;
};

/**
 * Pending Contact Requests card
 *
 * Fixes qa-overall-addendum 2026-04-07 "Issue 1": contact requests were
 * saved by the backend (`convex/user/contacts.ts`) but never surfaced in
 * the user-management UI, so receivers couldn't approve them. This card
 * subscribes to `getPendingContactRequests` and renders accept/decline
 * actions wired to the existing mutations.
 */
export function PendingContactRequestsCard({
  className,
  id,
  title = "Pending Contact Requests",
  description = "People who want to connect with you. Accept to add them to your contacts.",
}: PendingContactRequestsCardProps) {
  const { toast } = useToast();

  const requests = useQuery(api.user.contacts.getPendingContactRequests, {}) as
    | Array<{
        _id: Id<"socialContactRequests">;
        senderId: Id<"users">;
        status: string;
        message?: string;
        _creationTime: number;
        sender?: {
          _id: Id<"users">;
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
      }>
    | undefined;

  const acceptRequest = useMutation(api.user.contacts.acceptContactRequest);
  const declineRequest = useMutation(api.user.contacts.declineContactRequest);

  const handleAccept = async (requestId: Id<"socialContactRequests">) => {
    try {
      await acceptRequest({ requestId });
      toast({
        title: "Contact Added",
        description: "The request was accepted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: Id<"socialContactRequests">) => {
    if (!confirm("Decline this contact request?")) return;

    try {
      await declineRequest({ requestId });
      toast({
        title: "Request Declined",
        description: "The contact request has been declined.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <Card id={id} className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" />
              {title}
              <Badge variant="secondary">{requests.length}</Badge>
            </CardTitle>
            <CardDescription className="mt-1 text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {requests.map((req) => {
          const senderName = req.sender?.name || req.sender?.email || "Unknown user";
          return (
            <div
              key={req._id}
              className="flex items-start gap-3 rounded-md border bg-muted/30 p-3"
            >
              <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{senderName}</p>
                {req.message ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    "{req.message}"
                  </p>
                ) : null}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatRelativeTime(req._creationTime)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => handleAccept(req._id)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleDecline(req._id)}
                >
                  <X className="h-3.5 w-3.5" />
                  Decline
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
