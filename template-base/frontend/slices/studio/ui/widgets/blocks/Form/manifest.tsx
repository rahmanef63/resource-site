import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { FormBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Form';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { ClipboardList } from 'lucide-react';

export const formManifest: WidgetConfig = {
    label: "Form",
    category: "Blocks",
    description: "Embed a form.",
    icon: ClipboardList,
    defaults: {
        title: "New Form",
        submitButtonText: "Submit",
        className: ""
    },
    render: (props) => <FormBlock {...(props as any)} fields={[]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'title',
                label: 'Title',
                type: 'text'
            }),
            createCustomField({
                key: 'submitButtonText',
                label: 'Button Text',
                type: 'text'
            })
        ]
    }
};

