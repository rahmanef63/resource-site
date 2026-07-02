export const staffOperationsAgent = {
  id: 'staff-operations',
  name: 'Staff Operations Agent',
  capabilities: ['create', 'read', 'update', 'search'] as const,
  tools: [],
}

// Alias for sync-generated registry compatibility.
export const agent = { tools: {} }
