/**
 * Schedule Trigger Node
 * 
 * Run workflow on a schedule (cron expression).
 */

import { Clock } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    cronExpression: {
        type: 'text',
        default: '0 * * * *',
        label: 'Cron Expression',
        placeholder: '0 * * * *',
        description: 'Example: 0 * * * * (every hour), */5 * * * * (every 5 min)',
    },
    timezone: {
        type: 'select',
        default: 'UTC',
        label: 'Timezone',
        options: ['UTC', 'Asia/Jakarta', 'Asia/Singapore', 'America/New_York', 'Europe/London', 'Asia/Tokyo'],
    },
    enabled: {
        type: 'switch',
        default: true,
        label: 'Enabled',
    },
};

export const scheduleTriggerManifest: NodeManifest = {
    key: 'trigger.schedule',
    label: 'Schedule Trigger',
    category: 'Trigger',
    description: 'Run workflow on a schedule (cron expression)',
    icon: Clock,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Schedule Configuration'),
};
