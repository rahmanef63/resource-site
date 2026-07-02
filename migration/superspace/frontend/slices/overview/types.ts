
export interface OverviewData {
    workspaceName?: string
    generatedAt?: number
    members?: {
        total: number
        roles: Record<string, number>
    }
    tasks?: {
        total: number
        completed: number
    }
    projects?: {
        total: number
        active: number
    }
    documents?: number
    recentActivity?: Array<{
        action: string
        timestamp?: string | number
        user: string
        type?: string
    }>
}
