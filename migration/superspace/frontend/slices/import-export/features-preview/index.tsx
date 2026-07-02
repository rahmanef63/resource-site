/**
 * Import/Export Feature Preview
 * 
 * Shows a mock data transfer dashboard using the real DataTransferDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import { DataTransferDashboard } from '../components/DataTransferDashboard'
import type { ImportExportData, TransferJob } from '../types'

// Mock Data for Preview
const MOCK_DATA: ImportExportData = {
    isLoading: false,
    stats: {
        totalExports: 45,
        totalImports: 12,
        failedJobs: 3,
        activeJobs: 1
    },
    recentJobs: [
        {
            id: '1',
            type: 'export',
            entity: 'contacts',
            status: 'processing',
            progress: 45,
            startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            recordCount: 1250,
            fileName: 'contacts_export_2024.csv'
        },
        {
            id: '2',
            type: 'import',
            entity: 'products',
            status: 'completed',
            progress: 100,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            completedAt: new Date(Date.now() - 1000 * 60 * 58 * 2).toISOString(),
            recordCount: 450,
            fileName: 'products_import_v2.csv'
        },
        {
            id: '3',
            type: 'export',
            entity: 'transactions',
            status: 'completed',
            progress: 100,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
            recordCount: 8900,
            fileName: 'transactions_q3.csv'
        },
        {
            id: '4',
            type: 'import',
            entity: 'inventory',
            status: 'failed',
            progress: 20,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            recordCount: 0,
            fileName: 'inventory_update.csv'
        }
    ]
}

function ImportExportPreview({ compact }: FeaturePreviewProps) {
    const [data, setData] = React.useState<ImportExportData>(MOCK_DATA)

    const handleExport = async (entity: string, format: string) => {
        const entityName = typeof entity === 'string' ? entity : 'data'

        const newJob: TransferJob = {
            id: Math.random().toString(),
            type: 'export',
            entity: entityName,
            status: 'processing',
            progress: 0,
            startedAt: new Date().toISOString(),
            recordCount: 0,
            fileName: `${entityName}_export.${format}`
        }

        setData(prev => ({
            ...prev,
            recentJobs: [newJob, ...prev.recentJobs],
            stats: { ...prev.stats, activeJobs: prev.stats.activeJobs + 1 }
        }))

        // Simulate progress
        setTimeout(() => {
            setData(prev => ({
                ...prev,
                recentJobs: prev.recentJobs.map(j => j.id === newJob.id ? { ...j, progress: 50, recordCount: 500 } : j)
            }))
        }, 1500)

        setTimeout(() => {
            setData(prev => ({
                ...prev,
                recentJobs: prev.recentJobs.map(j => j.id === newJob.id ? { ...j, progress: 100, status: 'completed', recordCount: 1000 } : j),
                stats: {
                    ...prev.stats,
                    activeJobs: prev.stats.activeJobs,
                    totalExports: prev.stats.totalExports + 1
                }
            }))
        }, 3000)
    }

    const handleImport = async (file: File, entity: string, format: string) => {
        alert(`Mock Import started for ${entity}`)
    }

    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Import/Export</h3>
                <p className="text-2xl font-bold mt-2">{data.stats.totalExports + data.stats.totalImports}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <DataTransferDashboard
                    data={data}
                    onExport={handleExport}
                    onImport={handleImport}
                />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'import-export',
    name: 'Import & Export',
    description: 'Bulk data transfer and migration',
    component: ImportExportPreview,
    category: 'administration',
    tags: ['import', 'export', 'csv', 'data', 'migration'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Transfer History',
            description: 'Sample data transfer jobs',
            data: MOCK_DATA,
        },
    ],
})
