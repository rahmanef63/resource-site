/**
 * Communications Hooks
 * 
 * Data fetching and real-time subscription hooks for the communications feature.
 * These hooks integrate with Convex for backend data.
 * 
 * @module features/communications/hooks
 */

// Main feature hook (SSOT for feature data)
export {
  useCommunications,
  useConversation,
  useCall,
} from "./useCommunications"

export {
  useCommunicationWorkspace,
  resolveActiveCommunicationWorkspace,
} from "./useCommunicationWorkspace"

// Channel hooks
export {
  useChannels,
  useChannel,
  useChannelCategories,
  useChannelMembers,
  useChannelRoles,
  useChannelMutations,
} from "./useChannels"

// Message hooks
export {
  useMessages,
  useThreadMessages,
  useTypingIndicators,
  useMessageMutations,
} from "./useMessages"

// Call hooks
export {
  useCalls,
  useActiveCallData,
  useCallParticipantsData,
  useCallMutations,
} from "./useCalls"

// Presence hooks
export {
  usePresence,
  useUserPresence,
  usePresenceMutations,
} from "./usePresence"

// Direct message hooks
export {
  useDirectConversations,
  useDirectConversation,
  useDirectMessages,
  useDirectMessageMutations,
} from "./useDirectMessages"

// AI hooks — previous useAI stubs were unimplemented placeholders and
// removed 2026-04-20. When channel bots are re-scoped, add typed hooks
// here (and wire convex backend) instead of restoring the stubs.
