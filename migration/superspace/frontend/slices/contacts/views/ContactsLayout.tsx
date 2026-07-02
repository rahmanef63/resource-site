"use client";

import { useMemo, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell";
import { MemberInfoPanel, useMemberInfo } from "@/frontend/shared/communications";
import type { MemberInfoContact } from "@/frontend/shared/communications";
import { useContactsForQuickInvite } from "@/frontend/slices/user-management";
import type { ContactForQuickInvite } from "@/frontend/slices/user-management";
import { InviteContactToWorkspaceDialog } from "../components/InviteContactToWorkspaceDialog";

interface ContactsLayoutProps {
    children: React.ReactNode;
    selectedContact: MemberInfoContact | null;
    onCloseInspector: () => void;
    workspaceId: Id<"workspaces"> | null;
}

export function ContactsLayout({
    children,
    selectedContact,
    onCloseInspector,
    workspaceId,
}: ContactsLayoutProps) {
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    const memberInfo = useMemberInfo(selectedContact?.id, undefined);
    const contactsForInvite = useContactsForQuickInvite(workspaceId ?? undefined);

    const inviteCandidate = useMemo(() => {
        if (!selectedContact || !contactsForInvite) return null;
        return (
            contactsForInvite.find(
                (contact: ContactForQuickInvite) =>
                    String(contact._id) === String(selectedContact.id),
            ) ?? null
        );
    }, [contactsForInvite, selectedContact]);

    const workspaceInviteState = useMemo(() => {
        if (!selectedContact) {
            return {
                canInvite: false,
                label: "Invite to workspace",
                hint: "Select a contact to manage workspace access.",
            };
        }
        if (!workspaceId) {
            return {
                canInvite: false,
                label: "Workspace unavailable",
                hint: "Open contacts inside a workspace to invite members.",
            };
        }
        if (contactsForInvite === undefined) {
            return {
                canInvite: false,
                label: "Checking access",
                hint: "Loading workspace invite status for this contact.",
            };
        }
        if (!inviteCandidate) {
            return {
                canInvite: false,
                label: "Already a member",
                hint: "This contact is already in the workspace or cannot be invited from here.",
            };
        }
        if (inviteCandidate.hasPendingInvite) {
            return {
                canInvite: false,
                label: "Invitation pending",
                hint: "A workspace invitation for this contact is already pending.",
            };
        }
        return {
            canInvite: true,
            label: "Invite to workspace",
            hint: "Send a workspace invitation without leaving the contact details panel.",
        };
    }, [contactsForInvite, inviteCandidate, selectedContact, workspaceId]);

    const inspector = selectedContact ? (
        <MemberInfoPanel
            contact={selectedContact}
            profile={memberInfo.profile}
            sharedMedia={memberInfo.sharedMedia}
            sharedFiles={memberInfo.sharedFiles}
            sharedLinks={memberInfo.sharedLinks}
            commonGroups={memberInfo.commonGroups}
            loading={memberInfo.loading}
            onClose={onCloseInspector}
            isFavorite={memberInfo.isFavorite}
            isBlocked={memberInfo.isBlocked}
            onAddToFavorites={() =>
                selectedContact && workspaceId &&
                memberInfo.addToFavorites(selectedContact.id, workspaceId)
            }
            onRemoveFromFavorites={() =>
                selectedContact && workspaceId &&
                memberInfo.removeFromFavorites(selectedContact.id, workspaceId)
            }
            onBlock={() => selectedContact && memberInfo.blockMember(selectedContact.id)}
            onUnblock={() => selectedContact && memberInfo.unblockMember(selectedContact.id)}
            onReport={() => selectedContact && memberInfo.reportMember(selectedContact.id, "spam")}
            onInviteToWorkspace={
                workspaceInviteState.canInvite ? () => setIsInviteDialogOpen(true) : undefined
            }
            canInviteToWorkspace={workspaceInviteState.canInvite}
            workspaceInviteLabel={workspaceInviteState.label}
            workspaceInviteHint={workspaceInviteState.hint}
        />
    ) : undefined;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <FeatureShell
                featureId="contacts"
                storageKey="contacts-layout"
                inspector={inspector}
                aiPlaceholder="Ask about contacts..."
                aiContext={{
                    selectedContactId: selectedContact?.id,
                    selectedContactName: selectedContact?.name,
                }}
                defaultRightCollapsed={!selectedContact}
            >
                {children}
            </FeatureShell>
            {workspaceId && selectedContact ? (
                <InviteContactToWorkspaceDialog
                    workspaceId={workspaceId}
                    contact={selectedContact}
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                />
            ) : null}
        </div>
    );
}
