"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Send, Check, X } from "lucide-react";

const getUserInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    const words = name.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].substring(0, 2).toUpperCase();
  }
  if (email) return email.substring(0, 2).toUpperCase();
  return "U";
};

export interface ContactRequest {
  _id: string;
  message?: string;
  sentAt?: number;
  sender?: { name?: string; email?: string; image?: string };
  receiver?: { name?: string; email?: string; image?: string };
}

export interface ContactRequestListProps {
  pendingRequests?: ContactRequest[];
  sentRequests?: ContactRequest[];
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
}

export function ContactRequestList({
  pendingRequests = [],
  sentRequests = [],
  onAccept,
  onDecline,
}: ContactRequestListProps) {
  if (pendingRequests.length === 0 && sentRequests.length === 0) return null;

  return (
    <div className="space-y-4">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Contact Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.sender?.image || undefined} alt={request.sender?.name || "User"} />
                  <AvatarFallback>{getUserInitials(request.sender?.name, request.sender?.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {request.sender?.name || getUserInitials(undefined, request.sender?.email)}
                  </div>
                  <div className="text-sm text-muted-foreground">Wants to connect</div>
                  {request.message && (
                    <div className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button aria-label="Confirm" size="sm" onClick={() => onAccept?.(request._id)} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button aria-label="Close" size="sm" variant="outline" onClick={() => onDecline?.(request._id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sentRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Sent Requests ({sentRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentRequests.map((request) => (
              <div key={request._id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={request.receiver?.image || undefined} alt={request.receiver?.name || "User"} />
                  <AvatarFallback>{getUserInitials(request.receiver?.name, request.receiver?.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{request.receiver?.name || "Unknown User"}</div>
                  <div className="text-sm text-muted-foreground">Request sent — Pending response</div>
                  {request.message && (
                    <div className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</div>
                  )}
                </div>
                {request.sentAt && (
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.sentAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
