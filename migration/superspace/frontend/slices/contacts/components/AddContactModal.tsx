"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    X,
    Search,
    User,
    UserPlus,
    Contact,
    Building2,
    Check,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import type { AddContactModalProps, WorkspaceMemberSummary } from "../types";
import { useWorkspaceMembers } from "@/frontend/shared/foundation/workspaces/api";

// Helper function to get user initials
const getUserInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
        const words = name.trim().split(' ');
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

export function AddContactModal({ workspaceId, onClose }: AddContactModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState("");

    // API mutation for sending contact request
    const sendContactRequest = useMutation(api.user.contacts.sendContactRequest);

    // Get workspace members
    const workspaceMembers = useWorkspaceMembers(workspaceId);

    const filteredMembers = (workspaceMembers as WorkspaceMemberSummary[] | undefined)?.filter((member: WorkspaceMemberSummary) =>
        member && (
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    ) || [];

    const handleSendRequest = async (userId: Id<"users">) => {
        try {
            await sendContactRequest({
                receiverId: userId,
                message: message.trim() || undefined
            });
            toast.success("Contact request sent!");
            setMessage("");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            toast.error(msg || "Failed to send contact request");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Contact className="w-5 h-5" />
                        Add Contact
                    </h2>
                    <Button aria-label="Close" variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search workspace members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Optional message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message (Optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hi! I'd like to connect with you..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Members list */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredMembers.map((member) => member && (
                                <div key={member.userId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={member.image || undefined}
                                            alt={member.name || "User"}
                                        />
                                        <AvatarFallback>
                                            {getUserInitials(member.name ?? undefined, member.email ?? undefined)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">
                                                {member.name || getUserInitials(undefined, member.email ?? undefined)}
                                            </span>
                                            <Building2 className="w-3 h-3 text-blue-500" />
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            {member.email || "No email available"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {member.role?.name || "Member"}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleSendRequest(member.userId)}
                                        className="flex items-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span className="text-xs">Add</span>
                                    </Button>
                                </div>
                            ))}

                            {filteredMembers.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <UserPlus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">No members found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 p-4 border-t">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
