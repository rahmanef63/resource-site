/**
 * Data Converters Module
 * 
 * Converters for transforming between TOON and other formats.
 */

// JSON
export {
    jsonToToon,
    parseJsonFile,
    toonToJson,
    toonToJsonString,
    toonToJsonBlob,
    downloadToonAsJson,
} from "./json-converter";
export type { JsonToToonOptions, ToonToJsonOptions } from "./json-converter";

// CSV
export {
    csvToToon,
    parseCsvFile,
    toonToCsv,
    toonToCsvBlob,
    downloadToonAsCsv,
} from "./csv-converter";
export type { CsvToToonOptions, ToonToCsvOptions } from "./csv-converter";

// Markdown
export {
    markdownToToon,
    toonToMarkdown,
    downloadToonAsMarkdown,
} from "./markdown-converter";
export type { MarkdownToToonOptions, ToonToMarkdownOptions } from "./markdown-converter";

// ============================================================================
// Universal Converter
// ============================================================================

import type { ToonDocument } from "../toon/types";
import { jsonToToon, parseJsonFile } from "./json-converter";
import { csvToToon, parseCsvFile } from "./csv-converter";
import { markdownToToon } from "./markdown-converter";

export type ImportFormat = "json" | "csv" | "markdown" | "md" | "toon";
export type ConverterExportFormat = "json" | "csv" | "markdown" | "md" | "toon";

/**
 * Detect format from file extension
 */
export function detectFormat(filename: string): ImportFormat {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "json":
            return "json";
        case "csv":
            return "csv";
        case "md":
        case "markdown":
            return "markdown";
        case "toon":
            return "toon";
        default:
            return "json"; // Default to JSON
    }
}

/**
 * Parse file to TOON based on format
 */
export async function parseFileToToon<T extends Record<string, any>>(
    file: File,
    format?: ImportFormat,
    options?: { type?: string }
): Promise<ToonDocument<T>> {
    const detectedFormat = format || detectFormat(file.name);
    const type = options?.type || file.name.split(".")[0];

    switch (detectedFormat) {
        case "json":
            return parseJsonFile<T>(file, { type });
        case "csv":
            return parseCsvFile<T>(file, { type });
        case "markdown":
        case "md":
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target?.result as string;
                        resolve(markdownToToon<T>(content, { type }));
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsText(file);
            });
        case "toon":
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target?.result as string;
                        resolve(JSON.parse(content) as ToonDocument<T>);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read file"));
                reader.readAsText(file);
            });
        default:
            throw new Error(`Unsupported format: ${detectedFormat}`);
    }
}

/**
 * Convert string content to TOON
 */
export function parseStringToToon<T extends Record<string, any>>(
    content: string,
    format: ImportFormat,
    options?: { type?: string }
): ToonDocument<T> {
    const type = options?.type || "data";

    switch (format) {
        case "json":
            return jsonToToon<T>(content, { type });
        case "csv":
            return csvToToon<T>(content, { type });
        case "markdown":
        case "md":
            return markdownToToon<T>(content, { type });
        case "toon":
            return JSON.parse(content) as ToonDocument<T>;
        default:
            throw new Error(`Unsupported format: ${format}`);
    }
}
