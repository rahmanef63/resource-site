import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { ProfileBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Profile';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { UserCircle } from 'lucide-react';

export const profileManifest: WidgetConfig = {
    label: "Profile",
    category: "Blocks",
    description: "User entity header.",
    icon: UserCircle,
    defaults: {
        name: "John Doe",
        role: "Product Manager",
        className: ""
    },
    render: (props) => <ProfileBlock {...(props as any)} name={props.name || "John Doe"} />,
    inspector: {
        fields: [
            createCustomField({
                key: 'name',
                label: 'Name',
                type: 'text'
            }),
            createCustomField({
                key: 'role',
                label: 'Role',
                type: 'text'
            }),
            createCustomField({
                key: 'email',
                label: 'Email',
                type: 'text'
            })
        ]
    }
};

