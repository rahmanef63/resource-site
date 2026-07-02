/**
 * Integrations Feature Preview
 * 
 * Shows a mock integrations dashboard using the real IntegrationsDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import { IntegrationsDashboard } from '../components/IntegrationsDashboard'
import type { IntegrationsData, ConnectedIntegration, AVAILABLE_INTEGRATIONS } from '../types'

// Mock Data for Preview
const MOCK_INTEGRATIONS: ConnectedIntegration[] = [
    {
        _id: '1',
        integrationId: 'slack',
        workspaceId: 'ws1',
        status: 'active',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        lastSyncAt: Date.now() - 1000 * 60 * 5,
    },
    {
        _id: '2',
        integrationId: 'github',
        workspaceId: 'ws1',
        status: 'active',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
        lastSyncAt: Date.now() - 1000 * 60 * 30,
    },
    {
        _id: '3',
        integrationId: 'hubspot',
        workspaceId: 'ws1',
        status: 'error',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        lastSyncAt: Date.now() - 1000 * 60 * 60 * 2,
    }
]

function IntegrationsPreview({ compact }: FeaturePreviewProps) {
    const [integrations, setIntegrations] = React.useState<ConnectedIntegration[]>(MOCK_INTEGRATIONS)

    const handleConnect = async (integrationId: string, name: string) => {
        await new Promise(resolve => setTimeout(resolve, 1500))
        const newIntegration: ConnectedIntegration = {
            _id: Math.random().toString(),
            integrationId,
            workspaceId: 'mock-ws',
            status: 'active',
            createdAt: Date.now(),
            lastSyncAt: Date.now()
        }
        setIntegrations(prev => [...prev, newIntegration])
    }

    const handleDisconnect = async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIntegrations(prev => prev.filter(i => i._id !== id))
    }

    const data: IntegrationsData = {
        isLoading: false,
        integrations,
        stats: {
            totalConnected: integrations.length,
            activeIntegrations: integrations.filter(i => i.status === 'active').length,
            totalAvailable: 12 // Mock count
        }
    }

    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Integrations</h3>
                <p className="text-2xl font-bold mt-2 text-blue-600">{integrations.length}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <IntegrationsDashboard
                    data={data}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'integrations',
    name: 'Integrations Hub',
    description: 'Connect external services and apps',
    component: IntegrationsPreview,
    category: 'administration',
    tags: ['integrations', 'api', 'webhooks', 'connect'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Connected Apps',
            description: 'Sample integration connections',
            data: { integrations: MOCK_INTEGRATIONS },
        },
    ],
})
