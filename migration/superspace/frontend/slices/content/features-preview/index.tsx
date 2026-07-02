/**
 * Content Feature Preview
 * 
 * Shows a mock content dashboard using the real ContentDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import ContentDashboard from '../components/ContentDashboard'
import type { ContentData } from '../types'

// Mock Data for Preview
const MOCK_DATA: ContentData = {
    stats: {
        totalItems: 45,
        published: 32,
        drafts: 8,
        scheduled: 5,
        views: 125000
    },
    recentContent: [
        { id: '1', title: 'Q4 Product Showcase', type: 'article', author: 'Mark T.', status: 'published', publishedAt: '2 hours ago', views: 1250 },
        { id: '2', title: 'About Us', type: 'page', author: 'Sarah J.', status: 'published', publishedAt: '1 year ago', views: 45000 },
        { id: '3', title: 'New Feature Demo', type: 'video', author: 'Mike B.', status: 'draft', views: 0 },
        { id: '4', title: 'Holiday Campaign', type: 'image', author: 'Design Team', status: 'scheduled', publishedAt: 'Next week', views: 0 },
        { id: '5', title: 'Customer Success Stories', type: 'article', author: 'Mark T.', status: 'published', publishedAt: 'Yesterday', views: 850 },
    ]
}

function ContentPreview({ compact, mockData }: FeaturePreviewProps) {
    const data = (mockData?.data as ContentData | undefined) ?? MOCK_DATA

    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Content</h3>
                <p className="text-2xl font-bold mt-2 text-blue-600">{Math.round(data.stats.views / 1000)}k</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
        )
    }

    return (
        <div className="h-full min-h-0 overflow-hidden rounded-xl border bg-background">
            <div className="h-full overflow-auto p-4 sm:p-6">
                <ContentDashboard data={data} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'content',
    name: 'Content Manager',
    description: 'Manage articles and assets',
    component: ContentPreview,
    category: 'operations',
    tags: ['content', 'cms', 'articles', 'blog'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Blog Demo',
            description: 'Standard blog content',
            data: MOCK_DATA,
        },
    ],
})
