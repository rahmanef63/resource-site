"use client"

import React, { useState } from "react"
import {
    ShoppingCart,
    CreditCard,
    Package,
    RotateCcw,
    DollarSign,
    Search,
    QrCode,
    Calculator,
    MoreHorizontal,
    Plus,
    Minus,
    Trash
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricCard, EmptyState, ActivityListItem } from "@/frontend/shared/ui/dashboard"
import type { PosData } from "../types"

interface PosDashboardProps {
    data: PosData
    isLoading?: boolean
}

export default function PosDashboard({ data, isLoading }: PosDashboardProps) {
    const [activeTab, setActiveTab] = useState("terminal")

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading POS data...</div>
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="flex w-full justify-evenly">
                    <TabsTrigger value="terminal">Register</TabsTrigger>
                    <TabsTrigger value="sales">Sales History</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>

                <TabsContent value="terminal" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Product Grid */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search products..." className="pl-8" />
                                </div>
                                <Button variant="outline"><QrCode className="h-4 w-4 mr-2" /> Scan</Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {data.popularProducts.map((product) => (
                                    <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors">
                                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                                                <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{product.stock} in stock</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {/* Placeholders to fill grid */}
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Card key={`ph-${i}`} className="border-dashed flex items-center justify-center p-4">
                                        <Plus className="h-6 w-6 text-muted-foreground/30" />
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Current Order (Cart) */}
                        <Card className="h-full flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex justify-between">
                                    Current Order
                                    <span className="text-muted-foreground">#0042</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4">
                                <div className="flex-1 space-y-3">
                                    {/* Mock Cart Item */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">Premium Widget</p>
                                            <p className="text-muted-foreground">$24.00 x 1</p>
                                        </div>
                                        <p className="font-bold">$24.00</p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium">Service Fee</p>
                                            <p className="text-muted-foreground">$5.00 x 1</p>
                                        </div>
                                        <p className="font-bold">$5.00</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>$29.00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>$2.90</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                        <span>Total</span>
                                        <span>$31.90</span>
                                    </div>
                                </div>

                                <Button className="w-full h-12 text-lg">Charge $31.90</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sales" className="space-y-4">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <MetricCard
                            title="Daily Sales"
                            value={`$${data.stats.totalSales.toLocaleString()}`}
                            icon={DollarSign}
                        />
                        <MetricCard
                            title="Transactions"
                            value={data.stats.transactionCount}
                            icon={ShoppingCart}
                        />
                        <MetricCard
                            title="Avg Order"
                            value={`$${data.stats.averageOrderValue}`}
                            icon={Calculator}
                        />
                        <MetricCard
                            title="Returns"
                            value={data.stats.returns}
                            icon={RotateCcw}
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Today's sales history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.recentTransactions.map((tx) => (
                                    <ActivityListItem
                                        key={tx.id}
                                        icon={tx.method === 'card' ? CreditCard : DollarSign}
                                        iconClassName="bg-blue-100 text-blue-600"
                                        title={`Order #${tx.id}`}
                                        meta={`${tx.items} items \u2022 ${tx.time}`}
                                        amount={`$${tx.total.toFixed(2)}`}
                                        status={{ label: tx.status, variant: tx.status === 'completed' ? 'secondary' : 'outline' }}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EmptyState
                                icon={Package}
                                title="Product Catalog"
                                description="Manage your products, prices, and categories"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
