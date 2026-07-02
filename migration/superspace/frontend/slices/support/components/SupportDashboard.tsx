/**
 * Support Dashboard
 * Lists tickets and shows chat
 */

"use client";

import React, { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { SupportChatContainer } from "./SupportChatContainer";
import { SupportTicketList } from "./SupportTicketList";
import { Ticket as TicketIcon } from "lucide-react";
import { EmptyState } from "@/frontend/shared/ui/dashboard";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column";

export type Ticket = {
  id: string;
  title: string;
  status: "open" | "pending" | "resolved" | "closed";
  customerId: string;
  customerName: string;
  createdAt: number;
  priority?: "low" | "normal" | "high";
};

export type SupportDashboardProps = {
  workspaceId: Id<"workspaces"> | null;
};

// Hook to fetch support tickets from Convex
const useSupportTickets = (workspaceId: Id<"workspaces"> | null) => {
  const rawTickets = useQuery(
    // @ts-ignore — deep type recursion in Convex API refs
    api.features.support.queries.getWorkspaceTickets,
    workspaceId ? { workspaceId } : "skip"
  );

  const tickets: Ticket[] = (rawTickets ?? []).map(ticket => ({
    id: String(ticket._id),
    title: (ticket as any).subject ?? (ticket as any).title ?? "Support Request",
    status: ticket.status as "open" | "pending" | "resolved" | "closed",
    customerId: String(ticket.customerId),
    customerName: ticket.customer?.name ?? "Customer",
    createdAt: ticket._creationTime ?? Date.now(),
    priority: ticket.priority as "low" | "normal" | "high" | undefined,
  }));

  return { tickets, isLoading: workspaceId !== null && rawTickets === undefined };
};

/**
 * Support Dashboard with ticket list and chat
 */
export function SupportDashboard({ workspaceId }: SupportDashboardProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { tickets, isLoading } = useSupportTickets(workspaceId);

  const handleTicketUpdate = (ticketId: string, update: any) => {
    // TODO: Update ticket in backend
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 min-h-0">
        <FeatureThreeColumnLayout
          preset="feature"
          storageKey="support-layout"
          persistState={true}
          leftLabel="Support Tickets"
          centerLabel={selectedTicket ? "Ticket Conversation" : "Support Inbox"}
          rightHidden
          sidebarContent={
            <SupportTicketList
              tickets={tickets}
              isLoading={isLoading}
              selectedTicketId={selectedTicket?.id ?? null}
              onSelectTicket={setSelectedTicket}
            />
          }
          mainContent={selectedTicket ? (
            <SupportChatContainer
              workspaceId={workspaceId}
              ticketId={selectedTicket.id}
              ticketTitle={selectedTicket.title}
              ticketStatus={selectedTicket.status}
              customerId={selectedTicket.customerId}
              onTicketUpdate={handleTicketUpdate}
            />
          ) : (
            <EmptyState
              icon={TicketIcon}
              title="Select a ticket"
              description="Choose a support ticket from the list to view the conversation and respond to your customers."
              className="h-full"
            />
          )}
        />
      </div>
    </div>
  );
}
