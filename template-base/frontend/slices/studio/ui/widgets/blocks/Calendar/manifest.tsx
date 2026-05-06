import type { WidgetConfig } from '../../../types/index';
import { CalendarBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Calendar } from 'lucide-react';

export const calendarManifest: WidgetConfig = {
    label: "Calendar",
    category: "Blocks",
    description: "Date picker or event view.",
    icon: Calendar,
    defaults: {
        mode: "single",
        className: ""
    },
    render: (props: any) => <CalendarBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'mode',
                label: 'Selection Mode',
                type: 'select',
                options: ['single', 'multiple', 'range']
            })
        ]
    }
};
