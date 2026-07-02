import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { BiData, BiMetric, ChartDataPoint } from "../types"

/**
 * Hook for BI feature
 */
export function useBi(workspaceId: Id<"workspaces"> | null | undefined): BiData {
  const dashboards = useQuery(
    api.features.bi.queries.getDashboards,
    workspaceId ? { workspaceId } : "skip"
  )

  const metrics = useQuery(
    api.features.bi.queries.getMetrics,
    workspaceId ? { workspaceId } : "skip"
  )

  // Transform backend data to frontend types (MOCKING transformation for now as backend shape is unknown/simple)
  // We ignore the actual 'metrics' array content for now to avoid the Property 'x' does not exist on type ...[] error
  // In a real implementation, we would key off specific metric IDs or categories found in the array.

  const revenue: BiMetric = {
    label: "Revenue",
    value: "$45,231.89", // Mock value
    change: 12,
    trend: 'up',
    period: 'month'
  };

  const activeUsers: BiMetric = {
    label: "Active Users",
    value: "2,350", // Mock value
    change: 8,
    trend: 'up',
    period: 'month'
  };

  const conversionRate: BiMetric = {
    label: "Conversion Rate",
    value: "3.2%", // Mock value
    change: -2,
    trend: 'down',
    period: 'month'
  };

  const churnRate: BiMetric = {
    label: "Churn Rate",
    value: "2.4%", // Mock value
    change: 0.1,
    trend: 'neutral',
    period: 'month'
  };

  // Mocking Charts Data for "Real" view until backend provides it
  const revenueHistory: ChartDataPoint[] = [
    { name: 'Jan', value: 4000, secondaryValue: 2400 },
    { name: 'Feb', value: 3000, secondaryValue: 1398 },
    { name: 'Mar', value: 2000, secondaryValue: 9800 },
    { name: 'Apr', value: 2780, secondaryValue: 3908 },
    { name: 'May', value: 1890, secondaryValue: 4800 },
    { name: 'Jun', value: 2390, secondaryValue: 3800 },
    { name: 'Jul', value: 3490, secondaryValue: 4300 },
  ];

  const userGrowth: ChartDataPoint[] = [
    { name: 'Mon', value: 120, secondaryValue: 80 },
    { name: 'Tue', value: 150, secondaryValue: 90 },
    { name: 'Wed', value: 180, secondaryValue: 100 },
    { name: 'Thu', value: 220, secondaryValue: 110 },
    { name: 'Fri', value: 300, secondaryValue: 150 },
    { name: 'Sat', value: 250, secondaryValue: 130 },
    { name: 'Sun', value: 280, secondaryValue: 140 },
  ];

  const deviceUsage: ChartDataPoint[] = [
    { name: 'Desktop', value: 60 },
    { name: 'Mobile', value: 30 },
    { name: 'Tablet', value: 10 },
  ];

  return {
    isLoading: (dashboards === undefined || metrics === undefined) && workspaceId !== null && workspaceId !== undefined,
    metrics: {
      revenue,
      activeUsers,
      conversionRate,
      churnRate
    },
    revenueHistory,
    userGrowth,
    deviceUsage
  }
}
