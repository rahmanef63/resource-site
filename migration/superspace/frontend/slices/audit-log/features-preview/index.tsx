/**
 * Audit Log Feature Preview
 * 
 * Shows a mock audit log dashboard using the real AuditLogDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import AuditLogDashboard from '../components/AuditLogDashboard'
import type { AuditLogData } from '../types'

// Mock Data for Preview
const MOCK_DATA: AuditLogData = {
    stats: {
        totalEvents: 12450,
        criticalEvents: 3,
        activeUsers: 42,
        systemHealth: 'Healthy'
    },
    recentEvents: [
        { id: '1', timestamp: '10:42:15', status: 'success', action: 'Login', actor: 'Alice Chen', target: 'Auth / Web', ipAddress: '192.168.1.1' },
        { id: '2', timestamp: '10:40:02', status: 'success', action: 'Create Invoice', actor: 'Bob Smith', target: 'Finance / INV-1001', ipAddress: '192.168.1.5' },
        { id: '3', timestamp: '10:35:55', status: 'failure', action: 'Delete User', actor: 'Admin', target: 'Users / unknown-id', ipAddress: '10.0.0.1' },
        { id: '4', timestamp: '10:15:30', status: 'warning', action: 'Rate Limit', actor: 'API Bot', target: 'API / v1 / records', ipAddress: '203.0.113.42' },
        { id: '5', timestamp: '09:55:12', status: 'success', action: 'Update Profile', actor: 'Sarah Jones', target: 'Settings / Profile', ipAddress: '192.168.1.12' },
    ]
}

function AuditLogPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Audit Log</h3>
                <p className="text-2xl font-bold mt-2 text-green-600">99.9%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <AuditLogDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'audit-log',
    name: 'System Audit Log',
    description: 'Track security and activity',
    component: AuditLogPreview,
    category: 'administration',
    tags: ['audit', 'logs', 'security', 'monitoring'],
    mockDataSets: [
        {
            id: 'default',
            name: 'System Activity',
            description: 'Standard system logs',
            data: MOCK_DATA,
        },
    ],
})
