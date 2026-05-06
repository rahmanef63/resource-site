/**
 * Studio Feature Configuration
 * 
 * Unified visual builder combining CMS Builder and Automation into one canvas.
 */

import { defineFeature } from '@/frontend/shared/lib/features/defineFeature';

export const studioConfig = defineFeature({
    id: 'studio',
    name: 'Studio',
    description: 'Unified visual builder combining UI design and workflow automation in a single canvas',

    ui: {
        icon: 'Layers3',
        path: '/dashboard/studio',
        component: 'StudioPage',
        category: 'creativity',
        order: 21,
    },

    technical: {
        featureType: 'optional',
        hasUI: true,
        hasConvex: true,
        hasTests: true,
        version: '1.0.0',
    },

    status: {
        state: 'beta',
        isReady: true,
    },

    generation: {
        mode: 'engine-owned',
        sharedEngineId: 'studio',
    },

    bundles: {
        core: [],
        recommended: ['content-creator', 'digital-agency'],
        optional: ['startup', 'business-pro', 'personal-productivity'],
    },

    navigation: {
        route: '/dashboard/studio',
        aliases: ['builder', 'automation'],
    },

    tags: ['builder', 'automation', 'visual', 'canvas', 'workflow', 'ui'],
    permissions: ['studio.view', 'studio.create', 'studio.edit', 'studio.execute', 'studio.delete', 'studio.manage-templates'],
    dependencies: [],
});

export default studioConfig;
