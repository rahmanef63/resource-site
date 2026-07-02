export const ownerAnalyticsAgent = {
  id: 'owner-analytics',
  name: 'Owner Analytics Agent',
  capabilities: ['read', 'search'] as const,
  tools: [],
}

// Alias for sync-generated registry compatibility.
export const agent = { tools: {} }
