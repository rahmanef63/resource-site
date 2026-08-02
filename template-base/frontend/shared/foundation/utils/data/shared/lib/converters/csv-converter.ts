/**
 * CSV ↔ TOON Converters
 */

import type { ToonDocument, ToonValue } from "../toon/types";
import { serializeToToon } from "../toon/serializer";
import { parseToon } from "../toon/parser";

// ============================================================================
// CSV → TOON
// ============================================================================

export interface CsvToToonOptions {
    /** Type identifier for the TOON document */
    type?: string;
    /** Delimiter character */
    delimiter?: string;
    /** Skip first row (header) */
    hasHeader?: boolean;
    /** Custom header names (if no header in CSV) */
    headers?: string[];
    /** Include schema in output */
    includeSchema?: boolean;
    /** Trim whitespace from values */
    trimValues?: boolean;
    /** Parse numbers automatically */
    parseNumbers?: boolean;
    /** Parse booleans automatically */
    parseBooleans?: boolean;
}

/**
 * Convert CSV string to TOON document
 */
export function csvToToon<T extends Record<string, any>>(
    csv: string,
    options: CsvToToonOptions = {}
): ToonDocument<T> {
    const {
        type = "data",
        delimiter = ",",
        hasHeader = true,
        headers: customHeaders,
        trimValues = true,
        parseNumbers = true,
        parseBooleans = true,
    } = options;

    const lines = csv.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) {
        return serializeToToon<T>([], type);
    }

    // Parse headers
    let headers: string[];
    let dataStartIndex: number;

    if (customHeaders) {
        headers = customHeaders;
        dataStartIndex = 0;
    } else if (hasHeader) {
        headers = parseCsvLine(lines[0], delimiter, trimValues);
        dataStartIndex = 1;
    } else {
        // Generate headers: col1, col2, ...
        const firstRow = parseCsvLine(lines[0], delimiter, trimValues);
        headers = firstRow.map((_, i) => `col${i + 1}`);
        dataStartIndex = 0;
    }

    // Parse data rows
    const data: T[] = [];
    for (let i = dataStartIndex; i < lines.length; i++) {
        const values = parseCsvLine(lines[i], delimiter, trimValues);
        const record: any = {};

        for (let j = 0; j < headers.length; j++) {
            let value: any = values[j] ?? null;

            // Type conversion
            if (value !== null && value !== "") {
                if (parseNumbers && !isNaN(Number(value))) {
                    value = Number(value);
                } else if (parseBooleans) {
                    const lower = value.toLowerCase();
                    if (lower === "true" || lower === "yes" || lower === "1") {
                        value = true;
                    } else if (lower === "false" || lower === "no" || lower === "0") {
                        value = false;
                    }
                }
            } else if (value === "") {
                value = null;
            }

            record[headers[j]] = value;
        }

        data.push(record);
    }

    return serializeToToon<T>(data, type, {
        includeSchema: options.includeSchema ?? false,
        includeMetadata: true,
    });
}

/**
 * Parse single CSV line handling quoted values
 */
function parseCsvLine(
    line: string,
    delimiter: string = ",",
    trim: boolean = true
): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else if (char === '"') {
                inQuotes = false;
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === delimiter) {
                result.push(trim ? current.trim() : current);
                current = "";
            } else {
                current += char;
            }
        }
    }

    // Push last value
    result.push(trim ? current.trim() : current);

    return result;
}

/**
 * Parse CSV file to TOON
 */
export async function parseCsvFile<T extends Record<string, any>>(
    file: File,
    options: CsvToToonOptions = {}
): Promise<ToonDocument<T>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const toon = csvToToon<T>(content, options);
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
// TOON → CSV
// ============================================================================

export interface ToonToCsvOptions {
    /** Delimiter character */
    delimiter?: string;
    /** Include header row */
    includeHeader?: boolean;
    /** Include only specific fields */
    fields?: string[];
    /** Exclude fields */
    excludeFields?: string[];
    /** Quote all values */
    quoteAll?: boolean;
    /** Line ending */
    lineEnding?: "\n" | "\r\n";
}

/**
 * Convert TOON document to CSV string
 */
export function toonToCsv<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToCsvOptions = {}
): string {
    const {
        delimiter = ",",
        includeHeader = true,
        fields,
        excludeFields,
        quoteAll = false,
        lineEnding = "\n",
    } = options;

    // Determine which keys to include
    let keys = toon.$k;
    if (fields) {
        keys = fields.filter((f) => toon.$k.includes(f));
    }
    if (excludeFields) {
        keys = keys.filter((k) => !excludeFields.includes(k));
    }

    const keyIndices = keys.map((k) => toon.$k.indexOf(k));
    const lines: string[] = [];

    // Header row
    if (includeHeader) {
        lines.push(keys.map((k) => escapeCSV(k, delimiter, quoteAll)).join(delimiter));
    }

    // Data rows
    for (const row of toon.$d) {
        const values = keyIndices.map((i) => {
            const value = row[i];
            return escapeCSV(formatValue(value), delimiter, quoteAll);
        });
        lines.push(values.join(delimiter));
    }

    return lines.join(lineEnding);
}

/**
 * Format TOON value for CSV
 */
function formatValue(value: ToonValue): string {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === "object") {
        if ("$r" in value) return value.$r; // Reference
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Escape value for CSV
 */
function escapeCSV(value: string, delimiter: string, quoteAll: boolean): string {
    const needsQuoting =
        quoteAll ||
        value.includes(delimiter) ||
        value.includes('"') ||
        value.includes("\n") ||
        value.includes("\r");

    if (needsQuoting) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Create downloadable CSV blob from TOON
 */
export function toonToCsvBlob<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToCsvOptions = {}
): Blob {
    const csvString = toonToCsv(toon, options);
    return new Blob([csvString], { type: "text/csv;charset=utf-8" });
}

/**
 * Download TOON as CSV file
 */
export function downloadToonAsCsv<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    filename: string = "export.csv",
    options: ToonToCsvOptions = {}
): void {
    const blob = toonToCsvBlob(toon, options);
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
    csvToToon,
    parseCsvFile,
    toonToCsv,
    toonToCsvBlob,
    downloadToonAsCsv,
};
