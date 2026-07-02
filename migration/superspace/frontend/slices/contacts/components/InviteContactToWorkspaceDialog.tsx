"use client";

import * as React from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useBulkInviteContacts, useRoles } from "@/frontend/slices/user-management";

interface InviteContactToWorkspaceDialogProps {
  workspaceId: Id<"workspaces">;
  contact: MemberInfoContact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name?: string, email?: string) => {
  const source = name?.trim() || email || "U";
  const parts = source.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

export function InviteContactToWorkspaceDialog({
  workspaceId,
  contact,
  open,
  onOpenChange,
}: InviteContactToWorkspaceDialogProps) {
  const roles = useRoles(workspaceId);
  const bulkInviteContacts = useBulkInviteContacts();
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setMessage("");
      setSelectedRoleId("");
      return;
    }

    if (!selectedRoleId && roles && roles.length > 0) {
      const defaultRole = roles.find((role: any) => role.isDefault) ?? roles[0];
      setSelectedRoleId(String(defaultRole._id));
    }
  }, [open, roles, selectedRoleId]);

  const handleSubmit = async () => {
    if (!contact?.id || !selectedRoleId) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await bulkInviteContacts({
        workspaceId,
        ContactIds: [contact.id as Id<"users">],
        roleId: selectedRoleId as Id<"roles">,
        message: message.trim() || undefined,
      });

      if (result.successCount > 0) {
        toast.success(`${contact.name} was invited to the workspace.`);
        onOpenChange(false);
        return;
      }

      const firstError =
        result.results.find(
          (item: { success: boolean; error?: string }) => !item.success
        )?.error ??
        "Failed to send workspace invitation.";
      toast.error(firstError);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send workspace invitation."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} variant="modal" size="md">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Invite Contact to Workspace</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Send a workspace invitation to this contact with the role you want
          them to receive.
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        {contact ? (
          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>
                    {getInitials(contact.name, contact.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{contact.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {contact.email ?? "Email not shared"}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <UserPlus className="h-3.5 w-3.5" />
                  Contact
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-invite-role">Role to assign</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="contact-invite-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {(roles ?? []).map((role: any) => (
                    <SelectItem key={String(role._id)} value={String(role._id)}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: role.color ?? "#6366f1" }}
                        />
                        <span>{role.name}</span>
                        {role.level !== undefined ? (
                          <span className="text-xs text-muted-foreground">
                            Level {role.level}
                          </span>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-invite-message">
                Personal message
              </Label>
              <Input
                id="contact-invite-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Welcome aboard! We'd love to collaborate with you."
              />
            </div>

            <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4" />
                <p>
                  The invitation will be sent to{" "}
                  <span className="font-medium text-foreground">
                    {contact.email ?? "this contact"}
                  </span>
                  .
                </p>
              </div>
              <div className="mt-3 flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4" />
                <p>
                  Role access is controlled by the selected workspace role and
                  can be adjusted later from member management.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!contact || !selectedRoleId || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Send Invitation
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
