export interface BiMetric {
    label: string;
    value: string | number;
    change: number; // Percentage
    trend: 'up' | 'down' | 'neutral';
    period: string;
}

export interface ChartDataPoint {
    name: string;
    value: number;
    secondaryValue?: number;
}

export interface BiData {
    isLoading: boolean;
    metrics: {
        revenue: BiMetric;
        activeUsers: BiMetric;
        conversionRate: BiMetric;
        churnRate: BiMetric;
    };
    revenueHistory: ChartDataPoint[];
    userGrowth: ChartDataPoint[];
    deviceUsage: ChartDataPoint[];
}
