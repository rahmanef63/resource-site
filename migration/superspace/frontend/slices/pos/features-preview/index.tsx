/**
 * POS Feature Preview
 * 
 * Shows a mock POS terminal using the real PosDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import PosDashboard from '../components/PosDashboard'
import type { PosData } from '../types'

// Mock Data for Preview
const MOCK_DATA: PosData = {
    stats: {
        totalSales: 12500.50,
        transactionCount: 450,
        topProduct: 'Coffee Bean 1kg',
        averageOrderValue: 27.75,
        returns: 3
    },
    popularProducts: [
        { id: '1', name: 'Premium Coffee', category: 'Beverage', price: 15.00, stock: 45 },
        { id: '2', name: 'Ceramic Mug', category: 'Merch', price: 12.50, stock: 20 },
        { id: '3', name: 'Oat Milk 1L', category: 'Dairy', price: 4.50, stock: 12 },
        { id: '4', name: 'Espresso Maker', category: 'Equipment', price: 299.00, stock: 2 },
        { id: '5', name: 'Filter Papers', category: 'Supplies', price: 6.00, stock: 100 },
    ],
    recentTransactions: [
        { id: '1024', date: 'Today', time: '10:45 AM', items: 3, total: 45.50, method: 'card', status: 'completed' },
        { id: '1023', date: 'Today', time: '10:12 AM', items: 1, total: 12.50, method: 'cash', status: 'completed' },
        { id: '1022', date: 'Today', time: '09:55 AM', items: 2, total: 19.50, method: 'digital', status: 'completed' },
        { id: '1021', date: 'Today', time: '09:30 AM', items: 5, total: 62.00, method: 'card', status: 'completed' },
    ]
}

function PosPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">POS</h3>
                <p className="text-lg font-bold mt-2">New Sale</p>
                <p className="text-xs text-muted-foreground">Click to Open</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <PosDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'pos',
    name: 'Point of Sale',
    description: 'Retail management and checkout',
    component: PosPreview,
    category: 'business',
    tags: ['pos', 'retail', 'sales', 'checkout'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Retail Store',
            description: 'Coffee shop demo data',
            data: MOCK_DATA,
        },
    ],
})
