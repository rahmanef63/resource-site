/**
 * HR Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface HrStats {
    totalEmployees: number
    onLeave: number
    openPositions: number
    newHires: number
    departmentCount: number
}

export interface Employee {
    id: string
    name: string
    role: string
    department: string
    status: 'active' | 'on_leave' | 'remote'
    avatar?: string
}

export interface LeaveRequest {
    id: string
    employee: string
    type: 'vacation' | 'sick' | 'personal'
    dates: string
    days: number
    status: 'pending' | 'approved' | 'rejected'
}

export interface HrData {
    stats: HrStats
    recentHires: Employee[]
    leaveRequests: LeaveRequest[]
}
