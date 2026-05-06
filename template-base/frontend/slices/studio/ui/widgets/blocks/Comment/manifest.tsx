import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { CommentBlock } from '@/frontend/slices/studio/ui/widgets/blocks/Comment';
import { createCustomField } from '@/frontend/slices/studio/ui/inspector/standardFields';
import { MessageSquare } from 'lucide-react';

export const commentManifest: WidgetConfig = {
    label: "Comments",
    category: "Blocks",
    description: "Threaded discussions.",
    icon: MessageSquare,
    defaults: {
        className: ""
    },
    render: (props) => <CommentBlock {...(props as any)} comments={[]} currentUser={{ name: "User", avatar: "" }} onAddComment={() => { }} />,
    inspector: {
        fields: []
    }
};

