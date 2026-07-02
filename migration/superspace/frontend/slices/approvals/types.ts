/**
 * Approvals Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface ApprovalStats {
    totalRequests: number
    pending: number
    approved: number
    rejected: number
    avgTime: string
}

export interface ApprovalRequest {
    id: string
    title: string
    requester: string
    department: string
    date: string
    type: string
    status: 'pending' | 'approved' | 'rejected'
    priority: 'low' | 'medium' | 'high'
}

export interface ApprovalsData {
    stats: ApprovalStats
    recentRequests: ApprovalRequest[]
    pendingRequests: ApprovalRequest[]
}
