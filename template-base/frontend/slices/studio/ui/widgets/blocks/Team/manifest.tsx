import type { WidgetConfig } from '../../../types/index';
import { TeamBlock } from '.';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { Users } from 'lucide-react';

export const teamManifest: WidgetConfig = {
    label: "Team",
    category: "Blocks",
    description: "Display team composition by role.",
    icon: Users,
    defaults: {
        title: "Team Composition",
        description: "Members by role",
        roles: {},
        loading: false,
    },
    render: (props: any) => <TeamBlock {...(props as any)} />,
    inspector: {
        fields: [
            createCustomField({ key: 'title', label: 'Title', type: 'text' }),
            createCustomField({ key: 'description', label: 'Description', type: 'text' }),
            createCustomField({
                key: 'roles',
                label: 'Roles (JSON)',
                type: 'json',
                placeholder: '{"Engineering":[{"name":"Alice","avatar":""},{"name":"Bob","avatar":""}],"Design":[{"name":"Carol","avatar":""}]}',
            }),
        ]
    }
};
