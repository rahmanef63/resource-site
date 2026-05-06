/**
 * Data Node Executors
 * 
 * Executors for data manipulation nodes.
 */

import type { NodeExecutor } from '../types';
import { deepClone, merge } from '../engine';

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
 * Set - Set or merge data into context
 */
export const setExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const { json = '{}', mode = 'merge' } = config;

    const parsed = safeJsonParse(json);
    if (!parsed.ok) {
        throw new Error(`Invalid JSON: ${parsed.error}`);
    }

    if (mode === 'replace') {
        return {
            data: parsed.value,
            meta: { set: { mode: 'replace' } },
            output: parsed.value,
        };
    }

    // Merge mode
    return {
        data: parsed.value,
        meta: { set: { mode: 'merge' } },
        output: merge(context.data, parsed.value),
    };
};

/**
 * Data Transform - Transform data using JavaScript
 * 
 * Uses Function constructor for lightweight sandboxing.
 * NOT suitable for untrusted code - for demo purposes only.
 */
export const dataTransformExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        transformation = 'custom',
        script = 'return data;',
    } = config;

    // Create sandboxed context
    const sandboxContext = {
        data: deepClone(context.data),
        meta: deepClone(context.meta),
        variables: deepClone(context.variables),
    };

    try {
        let result: any;

        switch (transformation) {
            case 'map':
                // Map transformation expects array at data root or data.items
                const mapArray = Array.isArray(sandboxContext.data)
                    ? sandboxContext.data
                    : sandboxContext.data.items || [];
                const mapFn = new Function('item', 'index', `"use strict";\n${script}`);
                result = mapArray.map((item: any, index: number) => mapFn(item, index));
                break;

            case 'filter':
                // Filter transformation
                const filterArray = Array.isArray(sandboxContext.data)
                    ? sandboxContext.data
                    : sandboxContext.data.items || [];
                const filterFn = new Function('item', 'index', `"use strict";\n${script}`);
                result = filterArray.filter((item: any, index: number) => filterFn(item, index));
                break;

            case 'reduce':
                // Reduce transformation
                const reduceArray = Array.isArray(sandboxContext.data)
                    ? sandboxContext.data
                    : sandboxContext.data.items || [];
                const reduceFn = new Function('acc', 'item', 'index', `"use strict";\n${script}`);
                result = reduceArray.reduce((acc: any, item: any, index: number) =>
                    reduceFn(acc, item, index), {});
                break;

            case 'custom':
            default:
                // Custom transformation - full access to context
                const customFn = new Function('ctx', `"use strict";\n${script}`);
                const output = customFn(sandboxContext);

                // Handle return value
                if (output !== undefined && output !== null) {
                    if (output.data !== undefined) {
                        result = output.data;
                    } else if (output.meta !== undefined) {
                        return {
                            meta: output.meta,
                            output,
                        };
                    } else {
                        result = output;
                    }
                } else {
                    result = sandboxContext.data;
                }
                break;
        }

        return {
            data: { transformed: result },
            meta: { transform: { type: transformation } },
            output: result,
        };

    } catch (error) {
        throw new Error(`Transform error: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Merge - Merge multiple data sources
 */
export const mergeDataExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        sources = ['data'],
        targetKey = 'merged',
    } = config;

    let result: any = {};

    for (const source of sources) {
        const parts = source.split('.');
        let value: any = parts[0] === 'data' ? context.data :
            parts[0] === 'meta' ? context.meta :
                parts[0] === 'variables' ? context.variables :
                    context.data;

        for (let i = 1; i < parts.length; i++) {
            if (value == null) break;
            value = value[parts[i]];
        }

        if (value !== undefined) {
            result = merge(result, value);
        }
    }

    return {
        data: { [targetKey]: result },
        meta: { merge: { sources, targetKey } },
        output: result,
    };
};

/**
 * Extract - Extract specific fields from data
 */
export const extractExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        fields = [], // Array of { from: 'data.user.name', to: 'userName' }
    } = config;

    const result: any = {};

    for (const field of fields) {
        const parts = (field.from || '').split('.');
        let value: any = parts[0] === 'data' ? context.data :
            parts[0] === 'meta' ? context.meta :
                context.data;

        for (let i = 1; i < parts.length; i++) {
            if (value == null) break;
            value = value[parts[i]];
        }

        if (value !== undefined) {
            result[field.to || field.from] = value;
        }
    }

    return {
        data: { extracted: result },
        meta: { extract: { fields: fields.length } },
        output: result,
    };
};

/**
 * Export all data executors
 */
export const dataExecutors = {
    'set': setExecutor,
    'data.set': setExecutor,
    'dataTransform': dataTransformExecutor,
    'data.transform': dataTransformExecutor,
    'code.js': dataTransformExecutor,
    'merge': mergeDataExecutor,
    'data.merge': mergeDataExecutor,
    'extract': extractExecutor,
    'data.extract': extractExecutor,
};
