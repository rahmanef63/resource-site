import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { RichTextBlock } from '@/frontend/slices/studio/ui/widgets/blocks/RichText';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { FileText } from 'lucide-react';

export const richTextManifest: WidgetConfig = {
    label: "Rich Text",
    category: "Blocks",
    description: "WYSIWYG Editor.",
    icon: FileText,
    defaults: {
        content: "<p>Initial content...</p>",
        editable: true,
        className: ""
    },
    render: (props) => <RichTextBlock {...(props as any)} content={props.content || "<p>Hello World</p>"} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'editable',
                label: 'Editable',
                type: 'switch'
            })
        ]
    }
};

