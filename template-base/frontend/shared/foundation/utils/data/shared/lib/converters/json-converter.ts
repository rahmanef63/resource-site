/**
 * JSON ↔ TOON Converters
 */

import type { ToonDocument, ToonSerializeOptions } from "../toon/types";
import { serializeToToon, stringifyToon, stringifyToonPretty } from "../toon/serializer";
import { parseToon } from "../toon/parser";

// ============================================================================
// JSON → TOON
// ============================================================================

export interface JsonToToonOptions {
    /** Type identifier for the TOON document */
    type?: string;
    /** Include schema in output */
    includeSchema?: boolean;
    /** Include metadata */
    includeMetadata?: boolean;
}

/**
 * Convert JSON data to TOON document
 */
export function jsonToToon<T extends Record<string, any>>(
    json: T[] | { data: T[] } | string,
    options: JsonToToonOptions = {}
): ToonDocument<T> {
    // Parse if string
    let data: T[];
    if (typeof json === "string") {
        const parsed = JSON.parse(json);
        data = Array.isArray(parsed) ? parsed : parsed.data || [parsed];
    } else if (Array.isArray(json)) {
        data = json;
    } else {
        data = json.data || [];
    }

    const type = options.type || "data";

    return serializeToToon(data, type, {
        type,
        includeSchema: options.includeSchema ?? false,
        includeMetadata: options.includeMetadata ?? true,
    });
}

/**
 * Parse JSON file content to TOON
 */
export async function parseJsonFile<T extends Record<string, any>>(
    file: File,
    options: JsonToToonOptions = {}
): Promise<ToonDocument<T>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const toon = jsonToToon<T>(content, options);
                resolve(toon);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
}

// ============================================================================
// TOON → JSON
// ============================================================================

export interface ToonToJsonOptions {
    /** Pretty print output */
    pretty?: boolean;
    /** Include only specific fields */
    fields?: string[];
    /** Exclude fields */
    excludeFields?: string[];
}

/**
 * Convert TOON document to JSON array
 */
export function toonToJson<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToJsonOptions = {}
): T[] {
    const data = parseToon<T>(toon);

    // Filter fields if specified
    if (options.fields || options.excludeFields) {
        return data.map((record) => {
            const filtered: any = {};
            for (const [key, value] of Object.entries(record)) {
                if (options.fields && !options.fields.includes(key)) continue;
                if (options.excludeFields?.includes(key)) continue;
                filtered[key] = value;
            }
            return filtered;
        });
    }

    return data;
}

/**
 * Convert TOON document to JSON string
 */
export function toonToJsonString<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToJsonOptions = {}
): string {
    const data = toonToJson<T>(toon, options);
    return options.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/**
 * Create downloadable JSON blob from TOON
 */
export function toonToJsonBlob<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToJsonOptions = {}
): Blob {
    const jsonString = toonToJsonString(toon, { ...options, pretty: true });
    return new Blob([jsonString], { type: "application/json" });
}

/**
 * Download TOON as JSON file
 */
export function downloadToonAsJson<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    filename: string = "export.json",
    options: ToonToJsonOptions = {}
): void {
    const blob = toonToJsonBlob(toon, options);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default {
    jsonToToon,
    parseJsonFile,
    toonToJson,
    toonToJsonString,
    toonToJsonBlob,
    downloadToonAsJson,
};
