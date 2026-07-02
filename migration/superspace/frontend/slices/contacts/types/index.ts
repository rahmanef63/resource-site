import type { Id } from "@convex/_generated/dataModel";
import type { WorkspaceMemberSummary } from "@/frontend/shared/foundation/workspaces/types";
import type { Timestamped } from "../../../shared/types";

export interface ContactsListProps {
  workspaceId?: Id<"workspaces">;
}

/** Contact - represents a social connection between users */
export interface Contact extends Timestamped {
  _id: Id<"socialContacts">;
  user1Id: Id<"users">;
  user2Id: Id<"users">;
  status: "active" | "blocked" | string;
  contact?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export interface ContactRequest {
  _id: Id<"socialContactRequests">;
  senderId: Id<"users">;
  receiverId: Id<"users">;
  status: "pending" | "accepted" | "declined" | "blocked" | string;
  message?: string | null;
  sentAt: number;
  respondedAt?: number | null;
  sender?: { name?: string | null; email?: string | null; image?: string | null } | null;
  receiver?: { name?: string | null; email?: string | null; image?: string | null } | null;
}

export interface AddContactModalProps {
  workspaceId?: Id<"workspaces">;
  onClose: () => void;
}

export type { WorkspaceMemberSummary };
