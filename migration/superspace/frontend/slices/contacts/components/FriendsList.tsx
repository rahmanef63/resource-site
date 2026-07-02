"use client";

import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, Check, X, UserPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { AddContactModal } from "./AddContactModal";
import { ContactsView } from "./ContactsView";
import { useContactsApi } from "../api";
import type { ContactsListProps, ContactRequest } from "../types";

// Helper function to get user initials
const getUserInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return "U";
};

export function ContactsList({ workspaceId }: ContactsListProps) {
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const { Contacts, pendingRequests, sentRequests, acceptContactRequest, declineContactRequest } = useContactsApi();

  const handleAcceptRequest = async (requestId: ContactRequest["_id"]) => {
    try {
      await acceptContactRequest({ requestId });
      toast.success("Contact request accepted!");
    } catch (error) {
      toast.error("Failed to accept Contact request");
    }
  };

  const handleDeclineRequest = async (requestId: ContactRequest["_id"]) => {
    try {
      await declineContactRequest({ requestId });
      toast.success("Contact request declined");
    } catch (error) {
      toast.error("Failed to decline Contact request");
    }
  };

  return (
    <>
      <div className="container flex-col mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Contacts ({Contacts?.length || 0})
          </h3>
          <Button onClick={() => setShowAddContactModal(true)} className="flex items-center gap-2 self-start sm:self-auto">
            <UserPlus className="w-4 h-4" />
            Add Contacts
          </Button>
        </div>

        {/* Pending Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Contact Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request: ContactRequest) => (
                <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.sender?.image || undefined} alt={request.sender?.name || "User"} />
                    <AvatarFallback>
                      {getUserInitials(request.sender?.name, request.sender?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {request.sender?.name || getUserInitials(undefined, request.sender?.email)}
                    </div>
                    <div className="text-sm text-muted-foreground">Wants to be your Contact</div>
                    {request.message && (
                      <div className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button aria-label="Confirm" size="sm" onClick={() => handleAcceptRequest(request._id)} className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button aria-label="Close" size="sm" variant="outline" onClick={() => handleDeclineRequest(request._id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sent Requests */}
        {sentRequests && sentRequests.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Sent Requests ({sentRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sentRequests.map((request: ContactRequest) => (
                <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={request.receiver?.image || undefined} alt={request.receiver?.name || "User"} />
                    <AvatarFallback>
                      {getUserInitials(request.receiver?.name, request.receiver?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{request.receiver?.name || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground">Request sent — Pending response</div>
                    {request.message && (
                      <div className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.sentAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Contacts list */}
        <ContactsView workspaceId={workspaceId} />
      </div>

      {showAddContactModal && (
        <AddContactModal workspaceId={workspaceId} onClose={() => setShowAddContactModal(false)} />
      )}
    </>
  );
}
