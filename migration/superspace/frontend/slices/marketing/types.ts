/**
 * Marketing Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface MarketingStats {
    activeCampaigns: number
    totalLeads: number
    conversionRate: number
    spend: number
    roi: number
}

export interface Campaign {
    id: string
    name: string
    status: 'active' | 'scheduled' | 'ended' | 'draft'
    platform: 'email' | 'social' | 'search' | 'display'
    budget: number
    impressions: number
    clicks: number
    conversions: number
}

export interface MarketingData {
    stats: MarketingStats
    activeCampaigns: Campaign[]
    recentActivity: any[] // Placeholder for activity feed
}
