import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { MediaBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Media';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Image } from 'lucide-react';

export const mediaManifest: WidgetConfig = {
    label: "Media",
    category: "Blocks",
    description: "Image or Video.",
    icon: Image,
    defaults: {
        type: "image",
        src: "https://placehold.co/600x400",
        caption: "",
        aspectRatio: 1.77,
        allowFullscreen: true,
        className: ""
    },
    render: (props) => <MediaBlock {...(props as any)} type={props.type || "image"} src={props.src || ""} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'type',
                label: 'Type',
                type: 'select',
                options: ['image', 'video']
            }),
            createCustomField({
                key: 'src',
                label: 'Source URL',
                type: 'text'
            }),
            createCustomField({
                key: 'caption',
                label: 'Caption',
                type: 'text'
            }),
            createCustomField({
                key: 'aspectRatio',
                label: 'Aspect Ratio',
                type: 'number'
            }),
            createCustomField({
                key: 'allowFullscreen',
                label: 'Allow Fullscreen',
                type: 'switch'
            })
        ]
    }
};

