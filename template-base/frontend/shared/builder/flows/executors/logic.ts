/**
 * Logic Node Executors
 * 
 * Executors for logic/control flow nodes.
 */

import type { NodeExecutor } from '../types';
import { getByPath, sleep } from '../engine';

/**
 * Condition (IF) - Evaluates condition and sets result in meta
 */
export const conditionExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        operator = 'equals',
        leftValue = '',
        rightValue = '',
        path = '', // Alternative: use path to get value from context
    } = config;

    // Get left value - either from path or direct value
    let left: any;
    if (path) {
        left = getByPath({ data: context.data, meta: context.meta }, path);
    } else {
        left = leftValue;
    }

    const right = rightValue;

    // Evaluate condition
    let pass = false;
    switch (operator) {
        case 'equals':
            pass = String(left) === String(right);
            break;
        case 'not_equals':
            pass = String(left) !== String(right);
            break;
        case 'greater_than':
            pass = Number(left) > Number(right);
            break;
        case 'less_than':
            pass = Number(left) < Number(right);
            break;
        case 'contains':
            pass = String(left).includes(String(right));
            break;
        case 'not_contains':
            pass = !String(left).includes(String(right));
            break;
        case 'exists':
            pass = left !== undefined && left !== null;
            break;
        case 'not_exists':
            pass = left === undefined || left === null;
            break;
        case 'is_empty':
            pass = left === '' || left === null || left === undefined ||
                (Array.isArray(left) && left.length === 0);
            break;
        case 'is_not_empty':
            pass = left !== '' && left !== null && left !== undefined &&
                !(Array.isArray(left) && left.length === 0);
            break;
        default:
            pass = false;
    }

    return {
        meta: {
            condition: {
                path: path || 'direct',
                operator,
                leftValue: left,
                rightValue: right,
                pass,
            },
        },
        output: { pass, operator, left, right },
    };
};

/**
 * Delay - Pause execution for specified duration
 */
export const delayExecutor: NodeExecutor = async ({ node, signal }) => {
    const config = node.data.props || {};
    const { duration = 1000, unit = 'milliseconds' } = config;

    // Convert to milliseconds
    let ms = Number(duration);
    switch (unit) {
        case 'seconds':
            ms *= 1000;
            break;
        case 'minutes':
            ms *= 60 * 1000;
            break;
        case 'hours':
            ms *= 60 * 60 * 1000;
            break;
    }

    // Cap at 10 seconds for demo (prevent hanging)
    const cappedMs = Math.min(ms, 10000);

    // Wait with cancellation support
    await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, cappedMs);

        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                resolve();
            });
        }
    });

    return {
        meta: { delay: { requested: ms, actual: cappedMs } },
        output: { delayed: cappedMs },
    };
};

/**
 * Loop - Iterate over array (basic implementation)
 */
export const loopExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const { arrayPath = 'data', limit = 100 } = config;

    const array = getByPath({ data: context.data, meta: context.meta }, arrayPath);

    if (!Array.isArray(array)) {
        return {
            meta: { loop: { error: 'Not an array', path: arrayPath } },
            output: { items: [], count: 0 },
        };
    }

    // Limit iterations
    const items = array.slice(0, limit);

    return {
        data: { loopItems: items, loopIndex: 0 },
        meta: { loop: { path: arrayPath, count: items.length } },
        output: { items, count: items.length },
    };
};

/**
 * Switch/Case - Multiple condition branches
 */
export const switchExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        valuePath = 'data.type',
        cases = [], // Array of { value: string, label: string }
        defaultCase = 'default',
    } = config;

    const value = getByPath({ data: context.data, meta: context.meta }, valuePath);

    // Find matching case
    const matchedCase = cases.find((c: any) => c.value === String(value));
    const branch = matchedCase?.label || defaultCase;

    return {
        meta: {
            switch: {
                path: valuePath,
                value,
                branch,
                matched: !!matchedCase,
            },
        },
        output: { value, branch, matched: !!matchedCase },
    };
};

/**
 * Export all logic executors
 */
export const logicExecutors = {
    'condition': conditionExecutor,
    'logic.if': conditionExecutor,
    'delay': delayExecutor,
    'logic.delay': delayExecutor,
    'loop': loopExecutor,
    'logic.loop': loopExecutor,
    'switch': switchExecutor,
    'logic.switch': switchExecutor,
};
