/**
 * TOON Serializer
 * 
 * Serializes JavaScript objects to TOON format.
 */

import type {
    ToonDocument,
    ToonValue,
    ToonSchema,
    ToonSchemaField,
    ToonSerializeOptions,
    ToonFieldType,
} from "./types";
import { toToonType, isToonReference } from "./types";

// ============================================================================
// Main Serializer Functions
// ============================================================================

/**
 * Serialize array of objects to TOON document
 */
export function serializeToToon<T extends Record<string, any>>(
    data: T[],
    type: string,
    options: ToonSerializeOptions = {}
): ToonDocument<T> {
    const { includeSchema = false, includeMetadata = true } = options;

    // Extract keys from first record or use all unique keys
    const keys = extractKeys(data);

    // Compact values
    const rows = data.map((record) => compactValues(record, keys));

    // Build document
    const doc: ToonDocument<T> = {
        $v: 1,
        $t: options.type || type,
        $k: keys,
        $d: rows,
    };

    // Add metadata
    if (includeMetadata) {
        const now = Math.floor(Date.now() / 1000);
        doc.$m = {
            c: now,
            u: now,
            n: data.length,
        };
    }

    // Add schema
    if (includeSchema && data.length > 0) {
        doc.$s = inferSchema(data[0], keys);
    }

    return doc;
}

/**
 * Extract unique keys from data array
 */
export function extractKeys<T extends Record<string, any>>(data: T[]): string[] {
    if (data.length === 0) return [];

    // Use Set to get unique keys from all records
    const keySet = new Set<string>();
    for (const record of data) {
        Object.keys(record).forEach((key) => keySet.add(key));
    }

    // Sort keys for consistency (id first, then alphabetical)
    const keys = Array.from(keySet);
    return keys.sort((a, b) => {
        if (a === "id" || a === "_id") return -1;
        if (b === "id" || b === "_id") return 1;
        return a.localeCompare(b);
    });
}

/**
 * Convert record values to compact array format
 */
export function compactValues<T extends Record<string, any>>(
    record: T,
    keys: string[]
): ToonValue[] {
    return keys.map((key) => serializeValue(record[key]));
}

/**
 * Serialize individual value to TOON format
 */
export function serializeValue(value: any): ToonValue {
    // Handle null/undefined
    if (value === null || value === undefined) return null;

    // Handle Date
    if (value instanceof Date) {
        return value.toISOString();
    }

    // Handle Array (recursive)
    if (Array.isArray(value)) {
        return value.map(serializeValue);
    }

    // Handle Object (check for reference)
    if (typeof value === "object") {
        // Check if it's a reference
        if (value.$r) {
            return { $r: value.$r };
        }
        // Otherwise serialize as JSON string for complex objects
        return JSON.stringify(value);
    }

    // Handle primitives
    return value;
}

// ============================================================================
// Schema Inference
// ============================================================================

/**
 * Infer schema from sample record
 */
export function inferSchema<T extends Record<string, any>>(
    sample: T,
    keys: string[]
): ToonSchema {
    const fields: ToonSchemaField[] = keys.map((key) => {
        const value = sample[key];
        return {
            k: key,
            t: inferFieldType(value),
            r: value !== null && value !== undefined,
        };
    });

    return { fields };
}

/**
 * Infer TOON field type from value
 */
export function inferFieldType(value: any): ToonFieldType {
    if (value === null || value === undefined) return "s";
    if (typeof value === "string") {
        // Check if it looks like a date
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "d";
        return "s";
    }
    if (typeof value === "number") return "n";
    if (typeof value === "boolean") return "b";
    if (Array.isArray(value)) return "a";
    if (value instanceof Date) return "d";
    if (isToonReference(value)) return "r";
    if (typeof value === "object") return "o";
    return "s";
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Add record to existing TOON document
 */
export function addToToon<T extends Record<string, any>>(
    doc: ToonDocument<T>,
    record: T
): ToonDocument<T> {
    const values = compactValues(record, doc.$k);
    return {
        ...doc,
        $d: [...doc.$d, values],
        $m: doc.$m
            ? {
                ...doc.$m,
                u: Math.floor(Date.now() / 1000),
                n: doc.$d.length + 1,
            }
            : undefined,
    };
}

/**
 * Update record in TOON document by index
 */
export function updateToonRecord<T extends Record<string, any>>(
    doc: ToonDocument<T>,
    index: number,
    record: Partial<T>
): ToonDocument<T> {
    if (index < 0 || index >= doc.$d.length) {
        throw new Error(`Index ${index} out of bounds`);
    }

    const currentRow = doc.$d[index];
    const updatedRow = [...currentRow];

    for (const [key, value] of Object.entries(record)) {
        const keyIndex = doc.$k.indexOf(key);
        if (keyIndex !== -1) {
            updatedRow[keyIndex] = serializeValue(value);
        }
    }

    const newData = [...doc.$d];
    newData[index] = updatedRow;

    return {
        ...doc,
        $d: newData,
        $m: doc.$m
            ? {
                ...doc.$m,
                u: Math.floor(Date.now() / 1000),
            }
            : undefined,
    };
}

/**
 * Remove record from TOON document by index
 */
export function removeFromToon<T>(
    doc: ToonDocument<T>,
    index: number
): ToonDocument<T> {
    if (index < 0 || index >= doc.$d.length) {
        throw new Error(`Index ${index} out of bounds`);
    }

    const newData = doc.$d.filter((_, i) => i !== index);

    return {
        ...doc,
        $d: newData,
        $m: doc.$m
            ? {
                ...doc.$m,
                u: Math.floor(Date.now() / 1000),
                n: newData.length,
            }
            : undefined,
    };
}

/**
 * Stringify TOON document (minified)
 */
export function stringifyToon(doc: ToonDocument): string {
    return JSON.stringify(doc);
}

/**
 * Stringify TOON document (pretty)
 */
export function stringifyToonPretty(doc: ToonDocument): string {
    return JSON.stringify(doc, null, 2);
}

export default {
    serializeToToon,
    extractKeys,
    compactValues,
    serializeValue,
    addToToon,
    updateToonRecord,
    removeFromToon,
    stringifyToon,
};
