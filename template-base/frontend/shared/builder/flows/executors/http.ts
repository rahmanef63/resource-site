/**
 * HTTP Node Executors
 * 
 * Executors for HTTP-related nodes (request, response).
 */

import type { NodeExecutor } from '../types';
import { merge } from '../engine';

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
 * HTTP Request - Makes HTTP requests using fetch
 */
export const httpRequestExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const {
        method = 'GET',
        url = '',
        headers: headersJson = '{}',
        body = '',
        timeout = 30000,
    } = config;

    if (!url) {
        throw new Error('URL is required for HTTP request');
    }

    // Parse headers
    const headersParsed = safeJsonParse(headersJson);
    if (!headersParsed.ok) {
        throw new Error(`Invalid headers JSON: ${headersParsed.error}`);
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headersParsed.value,
        },
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body) {
        fetchOptions.body = body;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    fetchOptions.signal = controller.signal;

    try {
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        // Parse response
        const contentType = response.headers.get('content-type') || '';
        let responseBody: any;

        if (contentType.includes('application/json')) {
            responseBody = await response.json();
        } else {
            responseBody = await response.text();
        }

        const httpResult = {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
        };

        return {
            data: { http: httpResult },
            meta: { lastHttpRequest: { url, method, status: response.status } },
            output: httpResult,
        };

    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`HTTP request timed out after ${timeout}ms`);
        }

        throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Apply simple template syntax: {{path}} -> context value
 */
const applyTemplate = (template: string, context: { data: any; meta: any }): string => {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const parts = path.split('.');
        let value: any = parts[0] === 'data' ? context.data :
            parts[0] === 'meta' ? context.meta : context.data;

        const startIdx = parts[0] === 'data' || parts[0] === 'meta' ? 1 : 0;
        for (let i = startIdx; i < parts.length; i++) {
            if (value == null) break;
            value = value[parts[i]];
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value ?? match;
    });
};

/**
 * Respond - Ends workflow with output
 */
export const respondExecutor: NodeExecutor = async ({ node, context }) => {
    const config = node.data.props || {};
    const { bodyJson = '{"ok": true}' } = config;

    // Apply template substitution
    const templated = applyTemplate(bodyJson, { data: context.data, meta: context.meta });

    // Try to parse as JSON
    const parsed = safeJsonParse(templated);
    const output = parsed.ok ? parsed.value : templated;

    return {
        meta: { respond: output },
        output,
        continue: false, // Stop execution at respond
    };
};

/**
 * Export all HTTP executors
 */
export const httpExecutors = {
    'httpRequest': httpRequestExecutor,
    'http.request': httpRequestExecutor,
    'respond': respondExecutor,
};
