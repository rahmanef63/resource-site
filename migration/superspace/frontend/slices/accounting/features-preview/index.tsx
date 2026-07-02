/**
 * Accounting Feature Preview
 * 
 * Shows a mock financial dashboard using the real AccountingDashboard component
 */

"use client"

import * as React from 'react'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'
import AccountingDashboard from '../components/AccountingDashboard'
import type { AccountingData } from '../types'

// Mock Data for Preview
const MOCK_DATA: AccountingData = {
    stats: {
        totalRevenue: 245000,
        netProfit: 86000,
        pendingInvoices: 12,
        expenses: 159000,
        cashBalance: 124000
    },
    recentTransactions: [
        { id: '1', date: 'Today', description: 'Client Payment - Acme Corp', category: 'Sales', amount: 12500, type: 'income', status: 'completed' },
        { id: '2', date: 'Yesterday', description: 'Office Rent - Oct', category: 'Rent', amount: 4500, type: 'expense', status: 'completed' },
        { id: '3', date: 'Yesterday', description: 'Server Hosting AWS', category: 'Software', amount: 850, type: 'expense', status: 'completed' },
        { id: '4', date: 'Oct 24', description: 'Consulting Fee', category: 'Services', amount: 3200, type: 'income', status: 'pending' },
        { id: '5', date: 'Oct 23', description: 'Team Lunch', category: 'Meals', amount: 125, type: 'expense', status: 'completed' },
    ],
    recentInvoices: [
        { id: '1', customer: 'TechStart Inc', date: 'Oct 25', dueDate: 'Nov 10', amount: 8500, status: 'pending' },
        { id: '2', customer: 'Global Design', date: 'Oct 22', dueDate: 'Nov 05', amount: 4200, status: 'paid' },
        { id: '3', customer: 'Local Shop', date: 'Oct 15', dueDate: 'Oct 30', amount: 1500, status: 'overdue' },
    ]
}

function AccountingPreview({ compact }: FeaturePreviewProps) {
    if (compact) {
        return (
            <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">Accounting</h3>
                <p className="text-2xl font-bold mt-2">$245k</p>
                <p className="text-xs text-muted-foreground">Revenue YTD</p>
            </div>
        )
    }

    return (
        <div className="h-full border rounded-xl overflow-hidden bg-background">
            <div className="p-6 h-full overflow-auto">
                <AccountingDashboard data={MOCK_DATA} />
            </div>
        </div>
    )
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'accounting',
    name: 'Accounting & Finance',
    description: 'Manage finances, invoices, and expenses',
    component: AccountingPreview,
    category: 'business',
    tags: ['finance', 'invoices', 'expenses', 'money'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Default',
            description: 'Standard financial data',
            data: MOCK_DATA,
        },
    ],
})
