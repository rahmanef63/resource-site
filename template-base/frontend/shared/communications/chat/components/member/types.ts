import { MemberProfile } from "../../types/member";

export type MemberInfoSection =
  | "overview"
  | "media"
  | "files"
  | "links"
  | "events"
  | "encryption"
  | "groups";

export type MemberInfoNavItem = {
  id: MemberInfoSection;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
};

export type MemberInfoContact = MemberProfile & {
  /**
   * Optional presence string such as "last seen 2h ago"
   */
  presenceLabel?: string;
};

export type SharedMediaItem = {
  id: string;
  conversationId?: string;
  type: "image" | "video";
  url?: string;
  fileName?: string;
  mimeType?: string;
  createdAt?: number;
};

export type SharedFileItem = {
  id: string;
  conversationId?: string;
  name: string;
  size?: number;
  type?: string;
  createdAt?: number;
};

export type SharedLinkItem = {
  id: string;
  conversationId?: string;
  url: string;
  title?: string;
  createdAt?: number;
};

export type CommonGroup = {
  id: string;
  name: string;
  members: number;
  avatar?: string;
};

export type MemberInfoLoading = {
  profile?: boolean;
  sharedMedia?: boolean;
  sharedFiles?: boolean;
  sharedLinks?: boolean;
  commonGroups?: boolean;
  status?: boolean;
};
