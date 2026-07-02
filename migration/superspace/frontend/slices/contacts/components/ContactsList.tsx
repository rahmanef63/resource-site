"use client";

import { useState, useMemo } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Contact, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AddContactModal } from "./AddContactModal";
import { ContactsView } from "./ContactsView";
import { ContactsLayout } from "../views/ContactsLayout";
import { ContactRequestList } from "./ContactRequestList";
import { useContactsApi } from "../api";
import type { ContactsListProps } from "../types";
import type { MemberInfoContact } from "@/frontend/shared/communications";

type ContactItem = {
    contact?: {
        _id: Id<"users">;
        name?: string;
        image?: string;
        email?: string;
    } | null;
};

export function ContactsList({ workspaceId }: ContactsListProps) {
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<Id<"users"> | null>(null);
    const { contacts, pendingRequests, sentRequests, acceptContactRequest, declineContactRequest } = useContactsApi();

    const handleAcceptRequest = async (requestId: Id<"socialContactRequests">) => {
        try {
            await acceptContactRequest({ requestId });
            toast.success("Contact request accepted!");
        } catch (error) {
            toast.error("Failed to accept contact request");
        }
    };

    const handleDeclineRequest = async (requestId: Id<"socialContactRequests">) => {
        try {
            await declineContactRequest({ requestId });
            toast.success("Contact request declined");
        } catch (error) {
            toast.error("Failed to decline contact request");
        }
    };

    // Derived selected contact for the inspector
    const selectedContact = useMemo<MemberInfoContact | null>(() => {
        if (!contacts || !selectedContactId) return null;
        // Explicitly cast or type the item
        const found = (contacts as ContactItem[]).find(c => c.contact?._id === selectedContactId);
        if (!found || !found.contact) return null;

        return {
            id: found.contact._id,
            name: found.contact.name || "Unknown Contact",
            avatar: found.contact.image || undefined,
            isOnline: false, // Contacts API doesn't provide this yet
            presenceLabel: undefined,
            about: found.contact.email || undefined,
        };
    }, [contacts, selectedContactId]);

    return (
        <ContactsLayout
            selectedContact={selectedContact}
            onCloseInspector={() => setSelectedContactId(null)}
            workspaceId={workspaceId ?? null}
        >
            <div className="container flex-col mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Contact className="w-5 h-5 text-primary" />
                        Contacts ({contacts?.length || 0})
                    </h3>
                    <Button onClick={() => setShowAddContactModal(true)} className="flex items-center gap-2 self-start sm:self-auto">
                        <UserPlus className="w-4 h-4" />
                        Add Contact
                    </Button>
                </div>

                <ContactRequestList
                    pendingRequests={pendingRequests as any}
                    sentRequests={sentRequests as any}
                    onAccept={(id) => { void handleAcceptRequest(id as Id<"socialContactRequests">) }}
                    onDecline={(id) => { void handleDeclineRequest(id as Id<"socialContactRequests">) }}
                />

                {/* Contacts list */}
                <ContactsView
                    workspaceId={workspaceId}
                    onSelect={(id) => setSelectedContactId(id)}
                />
            </div>

            {showAddContactModal && (
                <AddContactModal workspaceId={workspaceId} onClose={() => setShowAddContactModal(false)} />
            )}
        </ContactsLayout>
    );
}
