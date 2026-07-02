/**
 * HR Feature Preview
 * 
 * Shows a mock HR dashboard using the real HrDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import HrDashboard from '../components/HrDashboard'
import type { HrData } from '../types'

// Mock Data for Preview
const MOCK_DATA: HrData = {
    stats: {
        totalEmployees: 42,
        onLeave: 3,
        openPositions: 5,
        newHires: 4,
        departmentCount: 6
    },
    recentHires: [
        { id: '1', name: 'Alice Chen', role: 'Frontend Developer', department: 'Engineering', status: 'active' },
        { id: '2', name: 'Marcus Jones', role: 'Product Designer', department: 'Design', status: 'remote' },
        { id: '3', name: 'Sarah Miller', role: 'HR Specialist', department: 'People', status: 'active' },
        { id: '4', name: 'David Kim', role: 'Sales Executive', department: 'Sales', status: 'active' },
    ],
    leaveRequests: [
        { id: '1', employee: 'John Doe', type: 'vacation', dates: 'Dec 20-25', status: 'pending', days: 5 },
        { id: '2', employee: 'Emma Wilson', type: 'sick', dates: 'Today', status: 'approved', days: 1 },
        { id: '3', employee: 'Michael Scott', type: 'personal', dates: 'Nov 15', status: 'rejected', days: 1 },
    ]
}

function HrPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">HR</h3>
                <p className="text-2xl font-bold mt-2">42</p>
                <p className="text-xs text-muted-foreground">Employees</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <HrDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'hr',
    name: 'HR Management',
    description: 'Manage employees, leave, and recruitment',
    component: HrPreview,
    category: 'operations',
    tags: ['hr', 'employees', 'people', 'recruitment'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Default',
            description: 'Standard HR data',
            data: MOCK_DATA,
        },
    ],
})
