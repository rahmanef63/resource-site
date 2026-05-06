/**
 * Node Registry - Auto-discovers and registers all node manifests
 * 
 * This module exports all node manifests from their subfolders
 * and provides registration functions for the cross-feature registry.
 */

import type { NodeManifest } from './types';
import type { ComponentConfig } from '@/frontend/shared/foundation';

// Import all node manifests
import * as triggerNodes from './triggers';
import * as httpNodes from './http';
import * as dataNodes from './data';
import * as flowNodes from './flow';
import * as aiNodes from './ai';
import * as integrationNodes from './integrations';
import * as errorNodes from './error';
import * as featureNodes from './features';

// ============================================================================
// Collect all manifests
// ============================================================================

export const allNodeManifests: NodeManifest[] = [
    // Triggers (4)
    triggerNodes.manualTriggerManifest,
    triggerNodes.webhookTriggerManifest,
    triggerNodes.scheduleTriggerManifest,
    triggerNodes.eventTriggerManifest,

    // HTTP (2)
    httpNodes.httpRequestManifest,
    httpNodes.httpRespondManifest,

    // Data (3)
    dataNodes.setVariableManifest,
    dataNodes.codeManifest,
    dataNodes.expressionManifest,

    // Flow Control (4)
    flowNodes.ifConditionManifest,
    flowNodes.switchManifest,
    flowNodes.loopManifest,
    flowNodes.waitManifest,

    // AI (2)
    aiNodes.openaiManifest,
    aiNodes.claudeManifest,

    // Integrations (3)
    integrationNodes.slackManifest,
    integrationNodes.emailManifest,
    integrationNodes.databaseManifest,

    // Error Handling (2)
    errorNodes.tryCatchManifest,
    errorNodes.retryManifest,

    // Feature Nodes - Calendar (4)
    featureNodes.calendarCreateManifest,
    featureNodes.calendarUpdateManifest,
    featureNodes.calendarDeleteManifest,
    featureNodes.calendarGetManifest,

    // Feature Nodes - Overview (1)
    featureNodes.overviewGetManifest,
];

// ============================================================================
// Registry Map
// ============================================================================

export const nodeManifestMap: Record<string, NodeManifest> = {};
allNodeManifests.forEach(manifest => {
    nodeManifestMap[manifest.key] = manifest;
});

// ============================================================================
// Helpers
// ============================================================================

export function getNodeManifest(key: string): NodeManifest | undefined {
    return nodeManifestMap[key];
}

export function getNodesByCategory(category: string): NodeManifest[] {
    return allNodeManifests.filter(m => m.category === category);
}

// ============================================================================
// Convert to ComponentConfig for cross-feature registry
// ============================================================================

function manifestToComponentConfig(manifest: NodeManifest): ComponentConfig {
    const inspector = manifest.inspector;
    const fields = inspector?.sections
        ? inspector.sections.flatMap((section) => section.fields)
        : inspector?.fields ?? [];

    return {
        key: manifest.key,
        label: manifest.label,
        category: manifest.category,
        feature: 'automation',
        description: manifest.description,
        icon: manifest.icon,
        defaults: manifest.defaults,
        inspector: {
            fields,
        },
    };
}

// ============================================================================
// Registration Function
// ============================================================================

export function registerAutomationNodes(
    registerComponent: (config: ComponentConfig) => void
): void {
    allNodeManifests.forEach(manifest => {
        registerComponent(manifestToComponentConfig(manifest));
    });
}

// Re-export for convenience
export * from './types';
