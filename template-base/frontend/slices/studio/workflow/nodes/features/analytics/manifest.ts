/**
 * Analytics Feature Nodes
 * 
 * Automation nodes for Analytics operations:
 * - Get metrics, Track events, Generate reports
 */

import { BarChart3, Activity, TrendingUp } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

// ============================================================================
// Get Metrics
// ============================================================================

const getMetricsProps: PropsConfig = {
    metric: {
        type: 'select',
        default: '',
        label: 'Metric',
        options: ['pageViews', 'sessions', 'users', 'conversions', 'revenue', 'custom'],
    },
    dateRange: {
        type: 'select',
        default: 'last7days',
        label: 'Date Range',
        options: ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'custom'],
    },
    groupBy: {
        type: 'select',
        default: 'day',
        label: 'Group By',
        options: ['hour', 'day', 'week', 'month'],
    },
};

export const analyticsGetMetricsManifest: NodeManifest = {
    key: 'feature.analytics.getMetrics',
    label: 'Analytics: Get Metrics',
    category: 'Integration',
    description: 'Retrieve analytics metrics',
    icon: BarChart3,
    props: getMetricsProps,
    defaults: getDefaultsFromProps(getMetricsProps),
    inspector: getInspectorFromProps(getMetricsProps, 'Metrics Configuration'),
};

// ============================================================================
// Track Event
// ============================================================================

const trackEventProps: PropsConfig = {
    eventName: {
        type: 'text',
        default: '',
        label: 'Event Name',
        placeholder: 'user_signup',
    },
    properties: {
        type: 'textarea',
        default: '{}',
        label: 'Properties (JSON)',
        placeholder: '{"plan": "premium", "source": "automation"}',
    },
    userId: {
        type: 'text',
        default: '',
        label: 'User ID',
        placeholder: '{{ $node.prev.data.userId }}',
    },
};

export const analyticsTrackEventManifest: NodeManifest = {
    key: 'feature.analytics.trackEvent',
    label: 'Analytics: Track Event',
    category: 'Integration',
    description: 'Track a custom analytics event',
    icon: Activity,
    props: trackEventProps,
    defaults: getDefaultsFromProps(trackEventProps),
    inspector: getInspectorFromProps(trackEventProps, 'Event Configuration'),
};

// ============================================================================
// Generate Report
// ============================================================================

const generateReportProps: PropsConfig = {
    reportType: {
        type: 'select',
        default: 'summary',
        label: 'Report Type',
        options: ['summary', 'detailed', 'comparison', 'funnel', 'cohort'],
    },
    format: {
        type: 'select',
        default: 'json',
        label: 'Output Format',
        options: ['json', 'csv', 'pdf'],
    },
    dateRange: {
        type: 'select',
        default: 'last30days',
        label: 'Date Range',
        options: ['last7days', 'last30days', 'lastQuarter', 'lastYear'],
    },
};

export const analyticsGenerateReportManifest: NodeManifest = {
    key: 'feature.analytics.generateReport',
    label: 'Analytics: Generate Report',
    category: 'Integration',
    description: 'Generate an analytics report',
    icon: TrendingUp,
    props: generateReportProps,
    defaults: getDefaultsFromProps(generateReportProps),
    inspector: getInspectorFromProps(generateReportProps, 'Report Configuration'),
};
