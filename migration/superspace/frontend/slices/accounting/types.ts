/**
 * Accounting Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface AccountingStats {
    totalRevenue: number
    netProfit: number
    pendingInvoices: number
    expenses: number
    cashBalance: number
}

export interface Transaction {
    id: string
    date: string
    description: string
    category: string
    amount: number
    type: 'income' | 'expense'
    status: 'completed' | 'pending' | 'failed'
}

export interface Invoice {
    id: string
    customer: string
    date: string
    dueDate: string
    amount: number
    status: 'paid' | 'pending' | 'overdue'
}

export interface AccountingData {
    stats: AccountingStats
    recentTransactions: Transaction[]
    recentInvoices: Invoice[]
}
