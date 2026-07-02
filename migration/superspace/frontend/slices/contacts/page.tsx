"use client"

import type { Id } from "@convex/_generated/dataModel";
import { ContactsList } from "./components/ContactsList";

export interface ContactsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function ContactsPage({ workspaceId }: ContactsPageProps) {
  return <ContactsList workspaceId={workspaceId as Id<"workspaces">} />;
}
