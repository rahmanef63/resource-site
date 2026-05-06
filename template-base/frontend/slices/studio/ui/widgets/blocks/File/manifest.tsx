import type { WidgetConfig } from '../../../types/index';
import { FileBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { FileInput } from 'lucide-react';

export const fileManifest: WidgetConfig = {
    label: "File Manager",
    category: "Blocks",
    description: "File upload and list.",
    icon: FileInput,
    defaults: {
        allowUpload: true,
        className: ""
    },
    render: (props: any) => <FileBlock {...(props as any)} files={[]} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'allowUpload',
                label: 'Allow Upload',
                type: 'switch'
            })
        ]
    }
};
