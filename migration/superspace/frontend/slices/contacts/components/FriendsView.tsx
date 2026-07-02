"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { ViewSwitcher, type LegacyViewConfig } from "@/frontend/shared/ui/layout/view-system";
import { useContacts, useRemoveContact } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserMinus } from "lucide-react";

type ContactRow = {
  _id: Id<"contacts">;
  Contact?: {
    _id: Id<"users">;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  createdAt?: number | null;
};

const initials = (name?: string | null, email?: string | null) => {
  const source = (name && name.trim()) || email || "U";
  const parts = source.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.substring(0, 2).toUpperCase();
};

export function ContactsView({ workspaceId }: { workspaceId?: Id<"workspaces"> }) {
  const rows = (useContacts() || []) as any as ContactRow[];
  const removeContact = useRemoveContact();

  const config: LegacyViewConfig<ContactRow> = useMemo(() => ({
    getId: (r) => String(r._id),
    columns: [
      {
        id: "user",
        header: "User",
        cell: (r) => (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={r.Contact?.image || undefined} alt={r.Contact?.name || "User"} />
              <AvatarFallback>{initials(r.Contact?.name, r.Contact?.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">{r.Contact?.name || initials(undefined, r.Contact?.email)}</div>
              <div className="text-xs text-gray-500 truncate">{r.Contact?.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "since",
        header: "Since",
        accessor: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""),
        hideOnCard: true,
      },
    ],
    actions: [
      {
        id: "message",
        label: "Message",
        icon: <MessageSquare className="w-4 h-4" />,
        onClick: (r) => {
          // Integrate to chat route if needed
          console.debug("message", r.Contact?._id);
        },
      },
      {
        id: "remove",
        label: "Remove",
        icon: <UserMinus className="w-4 h-4" />,
        onClick: async (r) => {
          if (!r.Contact?._id) return;
          if (!confirm("Remove this Contact?")) return;
          await removeContact({ contactId: r.Contact._id });
        },
      },
    ],
    card: {
      title: (r) => r.Contact?.name || initials(undefined, r.Contact?.email),
      subtitle: (r) => r.Contact?.email,
      avatar: (r) => (
        <Avatar className="w-8 h-8">
          <AvatarImage src={r.Contact?.image || undefined} alt={r.Contact?.name || "User"} />
          <AvatarFallback>{initials(r.Contact?.name, r.Contact?.email)}</AvatarFallback>
        </Avatar>
      ),
      extra: (r) => (
        <span className="text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
      ),
    },
    details: {
      fields: [
        { label: "Name", value: (r) => r.Contact?.name },
        { label: "Email", value: (r) => r.Contact?.email },
        { label: "Since", value: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : "") },
      ],
    },
    searchFn: (r, q) =>
      Boolean(r.Contact?.name?.toLowerCase().includes(q) || r.Contact?.email?.toLowerCase().includes(q)),
  }), [removeContact]);

  return (
    <ViewSwitcher
      storageKey={`Contacts.view.${workspaceId ?? "default"}`}
      initialMode="card"
      data={rows}
      config={config}
      searchable
      emptyState="No Contacts"
    />
  );
}
