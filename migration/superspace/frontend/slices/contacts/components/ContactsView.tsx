"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/frontend/shared/foundation/utils/convex/any-api";
import {
    ViewProvider,
    ViewRenderer,
    ViewType,
    type ViewConfig,
    type ViewColumn
} from "@/frontend/shared/ui/layout/view-system";
import { useContacts, useRemoveContact } from "../api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserMinus } from "lucide-react";
import { ContactContextMenu } from "./ContactContextMenu";
import { toast } from "sonner";

type ContactRow = {
    _id: Id<"socialContacts">;
    contact?: {
        _id: Id<"users">;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
    createdAt?: number | null;
    // Helper for easier access
    contactId?: Id<"users">;
};

const initials = (name?: string | null, email?: string | null) => {
    const source = (name && name.trim()) || email || "U";
    const parts = source.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.substring(0, 2).toUpperCase();
};

export function ContactsView({ workspaceId, onSelect }: { workspaceId?: Id<"workspaces">; onSelect?: (contactId: Id<"users">) => void }) {
    const router = useRouter();
    const rawContacts = useContacts() || [];
    const removeContact = useRemoveContact();

    // Create conversation mutation
    const createConversation = useMutation(api["features/chat/conversations"].createConversation);

    // Prepare data
    const rows: ContactRow[] = useMemo(() =>
        (rawContacts as any[]).map(c => ({
            ...c,
            contactId: c.contact?._id
        })),
        [rawContacts]);

    const handleMessage = async (contactId: Id<"users">) => {
        if (!workspaceId) {
            toast.error("Workspace context missing");
            return;
        }
        try {
            toast.loading("Starting chat...");
            const conversationId = await createConversation({
                workspaceId,
                type: "personal",
                participantIds: [contactId],
            });
            toast.dismiss();

            // Navigate to chat
            // Assuming the route structure. Adjust if needed.
            router.push(`/dashboard/workspaces/${workspaceId}/chat?id=${conversationId}`);
        } catch (error) {
            toast.dismiss();
            console.error("Failed to start chat", error);
            toast.error("Failed to start chat");
        }
    };

    const handleRemove = async (contactId: Id<"users">) => {
        if (!confirm("Remove this contact?")) return;
        try {
            await removeContact({ contactId });
            toast.success("Contact removed");
        } catch (error) {
            toast.error("Failed to remove contact");
        }
    };

    const config: ViewConfig<ContactRow> = useMemo(() => ({
        id: "contacts-view",
        type: ViewType.GRID,
        label: "Contacts",
        columns: [
            {
                id: "user",
                label: "Contact",
                render: (r) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={r.contact?.image || undefined} alt={r.contact?.name || "User"} />
                            <AvatarFallback>{initials(r.contact?.name, r.contact?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="font-medium truncate">{r.contact?.name || initials(undefined, r.contact?.email)}</div>
                            <div className="text-xs text-gray-500 truncate">{r.contact?.email}</div>
                        </div>
                    </div>
                ),
            },
            {
                id: "since",
                label: "Since",
                render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""),
            },
            {
                id: "actions",
                label: "Actions",
                render: (r) => (
                    <div className="flex items-center gap-1">
                        <button aria-label="Messages" onClick={(e) => { e.stopPropagation(); r.contactId && handleMessage(r.contactId); }} className="p-1 hover:bg-muted rounded">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button aria-label="Remove user" onClick={(e) => { e.stopPropagation(); r.contactId && handleRemove(r.contactId); }} className="p-1 hover:bg-muted rounded">
                            <UserMinus className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                )
            }
        ],
        // Grid View Card Renderer
        renderCard: (r) => {
            if (!r.contactId) return null;

            const cardContent = (
                <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={r.contact?.image || undefined} alt={r.contact?.name || "User"} />
                            <AvatarFallback>{initials(r.contact?.name, r.contact?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{r.contact?.name || initials(undefined, r.contact?.email)}</div>
                            <div className="text-sm text-muted-foreground truncate">{r.contact?.email}</div>
                        </div>
                    </div>
                    {r.createdAt && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Added {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            );

            return (
                <ContactContextMenu
                    contactId={r.contactId}
                    contactName={r.contact?.name || "Contact"}
                    onRemove={() => handleRemove(r.contactId!)}
                    onMessage={() => handleMessage(r.contactId!)}
                    onViewProfile={() => onSelect?.(r.contactId!)}
                >
                    <div onClick={() => onSelect?.(r.contactId!)}>
                        {cardContent}
                    </div>
                </ContactContextMenu>
            );
        },
        onSearch: (q) => {
            // ViewProvider handles filtering if we pass all data, BUT ViewConfig expects onSearch to be a callback for SERVER search usually?
            // Wait, ViewProvider handles client-side filtering if we don't implement onSearch?
            // Looking at ViewSwitcher-compat: it handles search internally using filteredDatas.

            // ViewProvider props: `data`
            // ViewState has `searchQuery`.
            // ViewProvider uses `data` prop.
            // If we want client side search, we should filter `data` passed to ViewProvider based on `state.searchQuery`.
            // But `state` is internal to ViewProvider?
            // No, ViewProvider manages state.

            // The `ViewProvider` logic in `ViewSwitcher-compat` does filtering BEFORE passing to Provider?
            // Yes: `const filteredData = ...`

            // So we need to implement filtering in the component body and pass filtered data to ViewProvider.
        }
    }), [workspaceId, createConversation, router]); // handleRemove/handleMessage deps

    // Search handling
    // ViewProvider component doesn't expose search state up easily unless we control it or use `useViewState` inside a child.
    // BUT we are the parent.
    // If we want search to work, `ViewRenderer` usually contains a search bar? 
    // `ViewHeader` contains search bar. `ViewSwitcher` (compat) does NOT render header.
    // So where is the search bar?
    // In `ContactsView` (old), `ViewSwitcher` had `searchable` prop.
    // `ViewSwitcher` rendered internal input? No, based on code reading it didn't seem to render an input.
    // Let's re-read ViewSwitcher-compat.

    return (
        <ViewProvider
            config={config}
            data={rows}
            initialView={ViewType.GRID}
            storageKey={`contacts.view.${workspaceId ?? "default"}`}
        >
            <ViewRenderer />
        </ViewProvider>
    );
}
