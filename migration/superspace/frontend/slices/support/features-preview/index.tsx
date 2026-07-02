"use client"

import * as React from "react"
import { Ticket as TicketIcon } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { EmptyState } from "@/frontend/shared/ui/dashboard"

import { SupportTicketList } from "../components/SupportTicketList"
import type { Ticket } from "../components/SupportDashboard"

const NOW = Date.now()

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TIC-1042",
    title: "Cannot export Q1 invoices to PDF — getting 500 error",
    status: "open",
    priority: "high",
    customerId: "cust_acme",
    customerName: "Acme Corp",
    createdAt: NOW - 86_400_000 * 0.5,
  },
  {
    id: "TIC-1041",
    title: "Need help connecting Stripe payment gateway",
    status: "pending",
    priority: "normal",
    customerId: "cust_kopi",
    customerName: "Kopi Kita Sentral",
    createdAt: NOW - 86_400_000 * 1,
  },
  {
    id: "TIC-1040",
    title: "Feature request: bulk-edit tags on contacts",
    status: "open",
    priority: "low",
    customerId: "cust_nusa",
    customerName: "Nusantara Studio",
    createdAt: NOW - 86_400_000 * 2,
  },
  {
    id: "TIC-1039",
    title: "How do I invite a new user to my workspace?",
    status: "resolved",
    priority: "normal",
    customerId: "cust_warung",
    customerName: "Warung Pintar",
    createdAt: NOW - 86_400_000 * 4,
  },
]

function SupportPreview({ compact }: FeaturePreviewProps) {
  const [selected, setSelected] = React.useState<Ticket | null>(MOCK_TICKETS[0])

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Support</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_TICKETS.filter((t) => t.status === "open").length} open · {MOCK_TICKETS.length} total tickets
        </p>
      </div>
    )
  }

  return (
    <div className="grid h-full grid-cols-[320px_1fr] overflow-hidden">
      <SupportTicketList
        tickets={MOCK_TICKETS}
        selectedTicketId={selected?.id ?? null}
        onSelectTicket={setSelected}
      />
      <div className="border-l">
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{selected.id}</span>
                <span className="text-xs rounded-full bg-muted px-2 py-0.5">{selected.status}</span>
              </div>
              <h3 className="mt-1 text-sm font-semibold">{selected.title}</h3>
              <p className="text-xs text-muted-foreground">{selected.customerName}</p>
            </div>
            <div className="flex-1 overflow-auto p-4 text-sm text-muted-foreground">
              <p>Conversation thread renders here in production via SupportChatContainer.</p>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={TicketIcon}
            title="Select a ticket"
            description="Choose a support ticket from the list to view the conversation."
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "support",
  name: "Support",
  description: "Customer support inbox with ticket triage and conversation threads.",
  component: SupportPreview,
  category: "communication",
  tags: ["support", "tickets", "helpdesk", "customer"],
  mockDataSets: [
    {
      id: "default",
      name: "Active inbox",
      description: "4 mock tickets across open/pending/resolved with real SupportTicketList.",
      data: { tickets: MOCK_TICKETS },
    },
  ],
})
