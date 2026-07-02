/**
 * Communications Feature
 * 
 * Unified communication platform supporting:
 * - Text channels (text, voice, video)
 * - Direct messages (1:1 and group)
 * - Voice/video calls with screen sharing
 * - Role-based permissions (Discord/Slack-like)
 * - AI bot integrations
 * - Real-time presence and typing indicators
 * - Threaded conversations
 * 
 * Migrated from: frontend/slices/chat + frontend/slices/calls
 * 
 * @module features/communications
 */

// Public exports for Communications feature
export { default as CommunicationsPage } from "./page"
export { default as config } from "./config"

// Main feature hook
export { useConversation } from "./hooks/useCommunications"

// Types
export * from "./shared/types"

// Store selectors
export {
  useCategories,
  useThreads,
  useActiveCall,
  useBots,
  useSidebarCollapsed,
  useViewMode,
} from "./shared/stores"

// View components
export { default as CommunicationsPageView } from "./views/CommunicationsPage"

// Section components
export { CommunicationSidebar, CommunicationSidebar as ChannelSidebar } from "./sections/CommunicationSidebar"

// Data fetching hooks
export { usePresence } from "./hooks/usePresence"

// AI/channel-bot hooks removed 2026-04-20 — the old useAI stubs were
// unimplemented placeholders. Re-add typed exports here when channel bots
// are re-scoped with a real backend.
