"use client";

import * as React from "react";
import { Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/frontend/shared/ui/dashboard";
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column";
// Local type mirror to avoid circular import with ./SupportDashboard.
// Keep in sync with the export of the same name in SupportDashboard.tsx.
type Ticket = {
  id: string;
  title: string;
  status: "open" | "pending" | "resolved" | "closed";
  customerId: string;
  customerName: string;
  createdAt: number;
  priority?: "low" | "normal" | "high";
};

export interface SupportTicketListProps {
  tickets: Ticket[];
  isLoading?: boolean;
  selectedTicketId?: string | null;
  onSelectTicket: (ticket: Ticket) => void;
  onCreateTicket?: () => void;
}

export function SupportTicketList({
  tickets,
  isLoading = false,
  selectedTicketId,
  onSelectTicket,
  onCreateTicket,
}: SupportTicketListProps) {
  return (
    <PanelSection label="Support tickets">
      <PanelSection.Header>
        <div className="p-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Support Tickets</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCreateTicket}
            aria-label="Create ticket"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items>
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No tickets yet"
            description="Support tickets from your customers will appear here."
            action={
              <Button size="sm" className="gap-2" onClick={onCreateTicket}>
                <Plus className="h-4 w-4" />
                Create Ticket
              </Button>
            }
          />
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={`w-full p-4 text-left border-b hover:bg-muted/50 transition-colors ${
                selectedTicketId === ticket.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{ticket.id}</span>
                    {ticket.priority === "high" && (
                      <span className="text-xs text-red-600">🔴 High</span>
                    )}
                  </div>
                  <p className="text-sm truncate mt-1">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ticket.customerName}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-800"
                      : ticket.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {ticket.status}
                </span>
              </div>
            </button>
          ))
        )}
      </PanelSection.Items>
    </PanelSection>
  );
}
