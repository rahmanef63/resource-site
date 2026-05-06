/**
 * Event Trigger Node
 * 
 * Trigger on internal system events.
 */

import { Zap } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

const props: PropsConfig = {
    eventType: {
        type: 'select',
        default: 'database.update',
        label: 'Event Type',
        options: [
            'database.insert',
            'database.update',
            'database.delete',
            'user.login',
            'user.register',
            'form.submit',
            'file.upload',
            'custom',
        ],
    },
    filter: {
        type: 'textarea',
        default: '',
        label: 'Filter Expression',
        placeholder: 'e.g. data.status === "active"',
        description: 'Optional filter to match specific events',
    },
    customEventName: {
        type: 'text',
        default: '',
        label: 'Custom Event Name',
        placeholder: 'my.custom.event',
        description: 'Required when Event Type is "custom"',
        advanced: true,
    },
};

export const eventTriggerManifest: NodeManifest = {
    key: 'trigger.event',
    label: 'Event Trigger',
    category: 'Trigger',
    description: 'Trigger on internal system events',
    icon: Zap,

    props,
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props, 'Event Configuration'),
};
