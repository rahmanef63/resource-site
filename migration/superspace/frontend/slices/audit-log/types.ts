/**
 * Audit Log Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface AuditStats {
    totalEvents: number
    criticalEvents: number
    activeUsers: number
    systemHealth: string
}

export interface LogEvent {
    id: string
    action: string
    actor: string
    target: string
    timestamp: string
    status: 'success' | 'failure' | 'warning'
    ipAddress: string
}

export interface AuditLogData {
    stats: AuditStats
    recentEvents: LogEvent[]
}
