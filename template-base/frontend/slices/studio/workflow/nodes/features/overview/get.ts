/**
 * Overview Get Data Node
 * 
 * Retrieves overview stats and activity for the workspace.
 * Uses the new props-based configuration pattern.
 */

import { LayoutDashboard } from 'lucide-react';
import type { NodeManifest, PropsConfig } from '../../types';
import { getDefaultsFromProps, getInspectorFromProps } from '@/frontend/slices/studio/ui/inspector/standardFields';

// Single source of truth for props
const props: PropsConfig = {
    workspaceId: {
        type: 'text',
        default: '',
        label: 'Workspace ID',
        description: 'Optional. Defaults to current workspace.',
        placeholder: '{{ $context.workspaceId }}',
    },
};

export const overviewGetManifest: NodeManifest = {
    key: 'feature.overview.get',
    label: 'Overview: Get Data',
    category: 'Integration',
    description: 'Retrieve overview stats and activity',
    icon: LayoutDashboard,

    // NEW: Single source of truth
    props,

    // Auto-generated from props (for backward compatibility)
    defaults: getDefaultsFromProps(props),
    inspector: getInspectorFromProps(props),
};
