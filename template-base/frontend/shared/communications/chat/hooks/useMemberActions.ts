/**
 * Member Actions Hooks
 * 
 * React hooks for member-related actions:
 * - Add/remove from favorites
 * - Block/unblock member
 * - Get member profile and shared data
 * 
 * @module shared/communications/chat/hooks/useMemberActions
 */

"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";
import type { MemberProfile } from "../types/member";
import type {
  CommonGroup,
  SharedFileItem,
  SharedLinkItem,
  SharedMediaItem,
} from "../components/member/types";

/**
 * Hook to get member profile
 */
export function useMemberProfile(memberId: Id<"users"> | string | undefined) {
  const args =
    memberId && memberId.length > 0
      ? ({ userId: memberId as string } as const)
      : ("skip" as const);
  return useQuery(api.user.memberActions.getMemberProfile, args) as
    | (MemberProfile & { presenceLabel?: string })
    | null
    | undefined;
}

/**
 * Hook to check if member is favorite
 */
export function useIsMemberFavorite(memberId: Id<"users"> | string | undefined) {
  const args = memberId && memberId.length > 0
    ? { memberId: memberId as string }
    : "skip" as const;
  return useQuery(api.user.memberActions.isMemberFavorite, args);
}

/**
 * Hook to check if member is blocked
 */
export function useIsMemberBlocked(memberId: Id<"users"> | string | undefined) {
  const args = memberId && memberId.length > 0
    ? { memberId: memberId as string }
    : "skip" as const;
  return useQuery(api.user.memberActions.isMemberBlocked, args);
}

/**
 * Hook for shared media with member
 */
export function useSharedMedia(
  memberId: string | undefined,
  conversationId?: string | Id<"conversations">,
  limit?: number,
) {
  const shouldQuery = Boolean(memberId?.length || conversationId);
  const args = shouldQuery
    ? ({ memberId, conversationId: conversationId as Id<"conversations"> | undefined, limit } as const)
    : ("skip" as const);
  return useQuery(api.user.memberActions.getSharedMedia, args) as
    | SharedMediaItem[]
    | undefined;
}

/**
 * Hook for shared files with member
 */
export function useSharedFiles(
  memberId: string | undefined,
  conversationId?: string | Id<"conversations">,
  limit?: number,
) {
  const shouldQuery = Boolean(memberId?.length || conversationId);
  const args = shouldQuery
    ? ({ memberId, conversationId: conversationId as Id<"conversations"> | undefined, limit } as const)
    : ("skip" as const);
  return useQuery(api.user.memberActions.getSharedFiles, args) as
    | SharedFileItem[]
    | undefined;
}

/**
 * Hook for shared links with member
 */
export function useSharedLinks(
  memberId: string | undefined,
  conversationId?: string | Id<"conversations">,
  limit?: number,
) {
  const shouldQuery = Boolean(memberId?.length || conversationId);
  const args = shouldQuery
    ? ({ memberId, conversationId: conversationId as Id<"conversations"> | undefined, limit } as const)
    : ("skip" as const);
  return useQuery(api.user.memberActions.getSharedLinks, args) as
    | SharedLinkItem[]
    | undefined;
}

/**
 * Hook for common groups with member
 */
export function useCommonGroups(memberId: string | undefined, limit?: number) {
  const args = memberId && memberId.length > 0
    ? { memberId, limit }
    : "skip" as const;
  return useQuery(api.user.memberActions.getCommonGroups, args) as
    | CommonGroup[]
    | undefined;
}

/**
 * Hook for member action mutations
 */
export function useMemberActions() {
  const addToFavoritesMutation = useMutation(api.user.memberActions.addToFavorites);
  const removeFromFavoritesMutation = useMutation(api.user.memberActions.removeFromFavorites);
  const blockMemberMutation = useMutation(api.user.memberActions.blockMember);
  const unblockMemberMutation = useMutation(api.user.memberActions.unblockMember);
  const reportMemberMutation = useMutation(api.user.memberActions.reportMember);

  const addToFavorites = useCallback(async (
    memberId: string,
    workspaceId: Id<"workspaces">,
  ) => {
    try {
      await addToFavoritesMutation({ memberId, workspaceId });
      toast.success("Added to favorites");
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      toast.error("Failed to add to favorites");
      throw error;
    }
  }, [addToFavoritesMutation]);

  const removeFromFavorites = useCallback(async (
    memberId: string,
    workspaceId: Id<"workspaces">,
  ) => {
    try {
      await removeFromFavoritesMutation({ memberId, workspaceId });
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      toast.error("Failed to remove from favorites");
      throw error;
    }
  }, [removeFromFavoritesMutation]);

  const blockMember = useCallback(async (memberId: string) => {
    try {
      await blockMemberMutation({ memberId });
      toast.success("Member blocked");
    } catch (error) {
      console.error("Failed to block member:", error);
      toast.error("Failed to block member");
      throw error;
    }
  }, [blockMemberMutation]);

  const unblockMember = useCallback(async (memberId: string) => {
    try {
      await unblockMemberMutation({ memberId });
      toast.success("Member unblocked");
    } catch (error) {
      console.error("Failed to unblock member:", error);
      toast.error("Failed to unblock member");
      throw error;
    }
  }, [unblockMemberMutation]);

  const reportMember = useCallback(async (
    memberId: string,
    reason: string,
    details?: string,
  ) => {
    try {
      await reportMemberMutation({ memberId, reason, details });
      toast.success("Report submitted");
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast.error("Failed to submit report");
      throw error;
    }
  }, [reportMemberMutation]);

  return {
    addToFavorites,
    removeFromFavorites,
    blockMember,
    unblockMember,
    reportMember,
  };
}

/**
 * Combined hook for member info with all data and actions
 */
export function useMemberInfo(
  memberId: string | undefined,
  conversationId?: string | Id<"conversations">,
) {
  const profile = useMemberProfile(memberId);
  const isFavorite = useIsMemberFavorite(memberId);
  const isBlocked = useIsMemberBlocked(memberId);
  const sharedMedia = useSharedMedia(memberId, conversationId);
  const sharedFiles = useSharedFiles(memberId, conversationId);
  const sharedLinks = useSharedLinks(memberId, conversationId);
  const commonGroups = useCommonGroups(memberId);
  const actions = useMemberActions();

  const loading = useMemo(
    () => ({
      profile: Boolean(memberId && profile === undefined),
      sharedMedia: Boolean((memberId || conversationId) && sharedMedia === undefined),
      sharedFiles: Boolean((memberId || conversationId) && sharedFiles === undefined),
      sharedLinks: Boolean((memberId || conversationId) && sharedLinks === undefined),
      commonGroups: Boolean(memberId && commonGroups === undefined),
      status: Boolean(memberId && (isFavorite === undefined || isBlocked === undefined)),
    }),
    [memberId, conversationId, profile, sharedMedia, sharedFiles, sharedLinks, commonGroups, isFavorite, isBlocked],
  );

  return {
    profile,
    isFavorite,
    isBlocked,
    sharedMedia,
    sharedFiles,
    sharedLinks,
    commonGroups,
    loading,
    ...actions,
  };
}
