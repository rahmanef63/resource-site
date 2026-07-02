"use client"

import * as React from "react"
import { Contact, UserPlus } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { ContactRequestList, type ContactRequest } from "../components/ContactRequestList"

const NOW = Date.now()

const MOCK_PENDING: ContactRequest[] = [
  { _id: "req_1", message: "Met at Jakarta DevConf 2026 — would love to stay in touch.",
    sender: { name: "Bella Setiawan", email: "bella@kopi-kita.id" } },
  { _id: "req_2",
    sender: { name: "Cahya Nugroho",  email: "cahya@nusantara.studio" } },
]

const MOCK_SENT: ContactRequest[] = [
  { _id: "req_3", sentAt: NOW - 86_400_000 * 2, message: "Following up on the demo request.",
    receiver: { name: "Dwi Rahayu",  email: "dwi@warung-pintar.id" } },
]

const MOCK_CONTACTS = [
  { id: "u_alif",  name: "Alif Pratama",   email: "alif@kopi-kita.id",       company: "Kopi Kita Sentral" },
  { id: "u_eko",   name: "Eko Saputra",    email: "eko@nusantara.studio",     company: "Nusantara Studio"  },
  { id: "u_fitri", name: "Fitri Handayani", email: "fitri@warung-pintar.id",  company: "Warung Pintar"     },
  { id: "u_gilang",name: "Gilang Mahesa",   email: "gilang@solo-craft.id",    company: "Solo Craft"        },
]

const initials = (name: string) => name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()

function ContactsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Contacts</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_CONTACTS.length} contacts · {MOCK_PENDING.length} pending
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            <Contact className="h-5 w-5 text-primary" />
            Contacts ({MOCK_CONTACTS.length})
          </h3>
          <Button className="flex items-center gap-2 self-start sm:self-auto">
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        <ContactRequestList
          pendingRequests={MOCK_PENDING}
          sentRequests={MOCK_SENT}
          onAccept={() => { /* preview: no-op */ }}
          onDecline={() => { /* preview: no-op */ }}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOCK_CONTACTS.map((c) => (
            <Card key={c.id} className="hover:shadow-md cursor-pointer">
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={c.name} />
                  <AvatarFallback>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "contacts",
  name: "Contacts",
  description: "Personal address book with contact requests and friend connections.",
  component: ContactsPreview,
  category: "social",
  tags: ["contacts", "address-book", "friends", "social"],
  mockDataSets: [
    {
      id: "default",
      name: "Active address book",
      description: "4 contacts + 2 pending + 1 sent request via real ContactRequestList.",
      data: { contacts: MOCK_CONTACTS, pending: MOCK_PENDING, sent: MOCK_SENT },
    },
  ],
})
