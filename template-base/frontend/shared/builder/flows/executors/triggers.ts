/**
 * Trigger Node Executors
 * 
 * Executors for workflow trigger nodes.
 */

import type { NodeExecutor, NodeExecutorOutput } from '../types';

/**
 * Safe JSON parse with error handling
 */
const safeJsonParse = (str: string): { ok: boolean; value?: any; error?: string } => {
    try {
        return { ok: true, value: JSON.parse(str) };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
};

/**
 * Manual Trigger - Starts workflow with configured input JSON
 */
export const manualTriggerExecutor: NodeExecutor = async ({ node }) => {
    const config = node.data.props || {};
    const inputJson = config.inputJson || '{}';

    const parsed = safeJsonParse(inputJson);
    if (!parsed.ok) {
        throw new Error(`Invalid input JSON: ${parsed.error}`);
    }

    return {
        data: parsed.value,
        meta: { trigger: 'manual', triggeredAt: Date.now() },
        output: { type: 'manual', data: parsed.value },
    };
};

/**
 * Webhook Trigger - Simulates incoming webhook with sample body
 */
export const webhookTriggerExecutor: NodeExecutor = async ({ node }) => {
    const config = node.data.props || {};
    const { path = '/webhook', method = 'POST', sampleBody = '{}' } = config;

    const parsed = safeJsonParse(sampleBody);
    if (!parsed.ok) {
        throw new Error(`Invalid sample body JSON: ${parsed.error}`);
    }

    return {
        data: parsed.value,
        meta: {
            trigger: 'webhook',
            triggeredAt: Date.now(),
            webhook: { path, method },
        },
        output: { type: 'webhook', path, method, data: parsed.value },
    };
};

/**
 * Schedule Trigger - Simulates scheduled execution
 */
export const scheduleTriggerExecutor: NodeExecutor = async ({ node }) => {
    const config = node.data.props || {};
    const { cron = '0 * * * *', inputJson = '{}' } = config;

    const parsed = safeJsonParse(inputJson);
    if (!parsed.ok) {
        throw new Error(`Invalid input JSON: ${parsed.error}`);
    }

    return {
        data: parsed.value,
        meta: {
            trigger: 'schedule',
            triggeredAt: Date.now(),
            schedule: { cron },
        },
        output: { type: 'schedule', cron, data: parsed.value },
    };
};

/**
 * Event Trigger - Simulates event-based trigger
 */
export const eventTriggerExecutor: NodeExecutor = async ({ node }) => {
    const config = node.data.props || {};
    const { eventType = 'custom', eventData = '{}' } = config;

    const parsed = safeJsonParse(eventData);
    if (!parsed.ok) {
        throw new Error(`Invalid event data JSON: ${parsed.error}`);
    }

    return {
        data: parsed.value,
        meta: {
            trigger: 'event',
            triggeredAt: Date.now(),
            event: { type: eventType },
        },
        output: { type: 'event', eventType, data: parsed.value },
    };
};

/**
 * Export all trigger executors
 */
export const triggerExecutors = {
    'trigger.manual': manualTriggerExecutor,
    'trigger.webhook': webhookTriggerExecutor,
    'trigger.schedule': scheduleTriggerExecutor,
    'trigger.event': eventTriggerExecutor,
};
