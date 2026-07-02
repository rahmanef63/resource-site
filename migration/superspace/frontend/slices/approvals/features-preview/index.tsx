/**
 * Approvals Feature Preview
 * 
 * Shows a mock approvals dashboard using the real ApprovalsDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import ApprovalsDashboard from '../components/ApprovalsDashboard'
import type { ApprovalsData } from '../types'

// Mock Data for Preview
const MOCK_DATA: ApprovalsData = {
    stats: {
        totalRequests: 142,
        pending: 12,
        approved: 118,
        rejected: 12,
        avgTime: '4.5 hours'
    },
    recentRequests: [
        { id: '1', title: 'Q4 Budget Increase', requester: 'Alice Chen', department: 'Sales', date: '2 hours ago', type: 'Budget', status: 'pending', priority: 'high' },
        { id: '2', title: 'New Laptop Purchase', requester: 'Bob Smith', department: 'Engineering', date: '4 hours ago', type: 'Procurement', status: 'pending', priority: 'medium' },
        { id: '3', title: 'Vendor Contract Renewal', requester: 'Sarah Johnson', department: 'Legal', date: 'Yesterday', type: 'Contract', status: 'approved', priority: 'high' },
        { id: '4', title: 'Conference Attendance', requester: 'Mike Brown', department: 'Marketing', date: 'Yesterday', type: 'Travel', status: 'rejected', priority: 'low' },
        { id: '5', title: 'Software License', requester: 'Jenny Wilson', department: 'Design', date: '2 days ago', type: 'Procurement', status: 'approved', priority: 'low' },
    ],
    pendingRequests: []
}

function ApprovalsPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Approvals</h3>
                <p className="text-2xl font-bold mt-2 text-orange-600">12</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <ApprovalsDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'approvals',
    name: 'Approvals Workflow',
    description: 'Manage requests and approvals',
    component: ApprovalsPreview,
    category: 'operations',
    tags: ['approvals', 'workflow', 'requests', 'reviews'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Corporate Demo',
            description: 'Standard approval queue',
            data: MOCK_DATA,
        },
    ],
})
