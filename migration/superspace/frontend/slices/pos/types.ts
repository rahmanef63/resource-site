/**
 * POS Feature Types
 * Shared interfaces for Dashboard and Preview
 */

export interface PosStats {
    totalSales: number
    transactionCount: number
    topProduct: string
    averageOrderValue: number
    returns: number
}

export interface Product {
    id: string
    name: string
    category: string
    price: number
    stock: number
    image?: string
}

export interface Transaction {
    id: string
    date: string
    time: string
    items: number
    total: number
    method: 'card' | 'cash' | 'digital'
    status: 'completed' | 'voided' | 'refunded'
}

export interface PosData {
    stats: PosStats
    popularProducts: Product[]
    recentTransactions: Transaction[]
}
