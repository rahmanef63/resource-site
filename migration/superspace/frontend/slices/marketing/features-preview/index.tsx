/**
 * Marketing Feature Preview
 * 
 * Shows a mock marketing dashboard using the real MarketingDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import MarketingDashboard from '../components/MarketingDashboard'
import type { MarketingData } from '../types'

// Mock Data for Preview
const MOCK_DATA: MarketingData = {
    stats: {
        activeCampaigns: 4,
        totalLeads: 850,
        conversionRate: 2.4,
        spend: 12500,
        roi: 3.2
    },
    activeCampaigns: [
        { id: '1', name: 'Q4 Product Launch', status: 'active', platform: 'social', budget: 5000, impressions: 125000, clicks: 3500, conversions: 120 },
        { id: '2', name: 'Newsletter Signup', status: 'active', platform: 'email', budget: 200, impressions: 5000, clicks: 800, conversions: 250 },
        { id: '3', name: 'Brand Awareness', status: 'active', platform: 'display', budget: 2000, impressions: 250000, clicks: 1200, conversions: 15 },
        { id: '4', name: 'Retargeting', status: 'active', platform: 'social', budget: 3500, impressions: 45000, clicks: 2100, conversions: 180 },
    ],
    recentActivity: []
}

function MarketingPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Marketing</h3>
                <p className="text-2xl font-bold mt-2 text-green-600">3.2x</p>
                <p className="text-xs text-muted-foreground">ROI YTD</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <MarketingDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'marketing',
    name: 'Marketing Campaigns',
    description: 'Track ads and campaign performance',
    component: MarketingPreview,
    category: 'operations',
    tags: ['marketing', 'ads', 'campaigns', 'growth'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Growth Demo',
            description: 'Standard campaign data',
            data: MOCK_DATA,
        },
    ],
})
