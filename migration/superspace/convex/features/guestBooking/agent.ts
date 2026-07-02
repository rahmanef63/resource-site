/**
 * Guest Booking AI Agent (stub)
 *
 * Surface for the hospitality concierge agent. Tools to be implemented:
 * - search_rooms(workspaceId, dates, guests)
 * - quote_booking(roomId, dates, relationship)
 * - explain_syari_requirements(relationship)
 */

export const guestBookingAgent = {
  id: 'guest-booking',
  name: 'Guest Booking Concierge',
  capabilities: ['create', 'read', 'update', 'search'] as const,
  tools: [],
}

// Alias for sync-generated registry compatibility.
export const agent = { tools: {} }
