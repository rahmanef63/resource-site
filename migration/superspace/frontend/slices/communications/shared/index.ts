/**
 * Communications Feature - Shared Module
 * 
 * Centralized exports for shared utilities, types, and hooks
 * 
 * @module features/communications/shared
 */

// Types
export * from "./types"

// Store
export {
  useCommunicationsStore,
  // Channel selectors
  useChannels,
  useCategories,
  useSelectedChannelId,
  useSelectedChannel,
  useChannelMessages,
  // Thread selectors
  useThreads,
  useSelectedThreadId,
  useThreadMessages,
  // Call selectors
  useActiveCall,
  useCallParticipants,
  useLocalMediaState,
  useScreenShares,
  // DM selectors
  useDirectConversations,
  useSelectedDirectId,
  useDirectMessages,
  // Presence selectors
  useUserPresence,
  useTypingIndicators,
  // AI selectors
  useBots,
  useChannelBots,
  // UI selectors
  useSidebarCollapsed,
  useActiveSidebarTab,
  useRightPanelOpen,
  useRightPanelContent,
  useActiveModal,
  useModalData,
  useViewMode,
  // Workspace & Privacy selectors
  useCommunicationWorkspaceId,
  useIsPrivateMode,
  useIsPrivateDMs,
} from "./stores"
