/**
 * Member profile information shared across chat experiences.
 * @module shared/chat/types/member
 */

import type { Id } from "@/convex/_generated/dataModel";

export type MemberProfile = {
  id: string;
  /** User ID in database - use this for API calls */
  userId?: Id<"users"> | string;
  name: string;
  username?: string;
  avatar?: string;
  phoneNumber?: string;
  about?: string;
  isOnline?: boolean;
  lastSeen?: string;
  email?: string;
  location?: string;
  jobTitle?: string;
  tags?: string[];
};
