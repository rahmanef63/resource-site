/**
 * Markdown ↔ TOON Converters
 */

import type { ToonDocument, ToonValue } from "../toon/types";
import { serializeToToon } from "../toon/serializer";
import { parseToon } from "../toon/parser";

// ============================================================================
// Markdown Table → TOON
// ============================================================================

export interface MarkdownToToonOptions {
    /** Type identifier for the TOON document */
    type?: string;
    /** Trim whitespace from values */
    trimValues?: boolean;
    /** Parse numbers automatically */
    parseNumbers?: boolean;
}

/**
 * Convert Markdown table to TOON document
 */
export function markdownToToon<T extends Record<string, any>>(
    markdown: string,
    options: MarkdownToToonOptions = {}
): ToonDocument<T> {
    const { type = "data", trimValues = true, parseNumbers = true } = options;

    // Extract table lines
    const lines = markdown
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.startsWith("|") && line.endsWith("|"));

    if (lines.length < 2) {
        return serializeToToon<T>([], type);
    }

    // Parse header
    const headers = parseMarkdownRow(lines[0], trimValues);

    // Skip separator line (contains dashes and colons)
    const dataLines = lines.slice(2);

    // Parse data rows
    const data: T[] = [];
    for (const line of dataLines) {
        const values = parseMarkdownRow(line, trimValues);
        const record: any = {};

        for (let i = 0; i < headers.length; i++) {
            let value: any = values[i] ?? null;

            if (value !== null && value !== "" && parseNumbers && !isNaN(Number(value))) {
                value = Number(value);
            }

            record[headers[i]] = value === "" ? null : value;
        }

        data.push(record);
    }

    return serializeToToon<T>(data, type);
}

/**
 * Parse Markdown table row
 */
function parseMarkdownRow(line: string, trim: boolean = true): string[] {
    return line
        .slice(1, -1) // Remove leading and trailing |
        .split("|")
        .map((cell) => (trim ? cell.trim() : cell));
}

// ============================================================================
// TOON → Markdown Table
// ============================================================================

export interface ToonToMarkdownOptions {
    /** Include only specific fields */
    fields?: string[];
    /** Exclude fields */
    excludeFields?: string[];
    /** Column alignment */
    alignment?: "left" | "center" | "right" | Record<string, "left" | "center" | "right">;
    /** Maximum column width (truncate) */
    maxWidth?: number;
    /** Include title */
    title?: string;
}

/**
 * Convert TOON document to Markdown table
 */
export function toonToMarkdown<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    options: ToonToMarkdownOptions = {}
): string {
    const { fields, excludeFields, alignment = "left", maxWidth, title } = options;

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

    // Title
    if (title) {
        lines.push(`## ${title}`, "");
    }

    // Header row
    lines.push("| " + keys.join(" | ") + " |");

    // Separator row with alignment
    const separators = keys.map((k) => {
        const align = typeof alignment === "string" ? alignment : alignment[k] || "left";
        switch (align) {
            case "left":
                return ":---";
            case "center":
                return ":---:";
            case "right":
                return "---:";
            default:
                return "---";
        }
    });
    lines.push("| " + separators.join(" | ") + " |");

    // Data rows
    for (const row of toon.$d) {
        const values = keyIndices.map((i) => {
            let value = formatMarkdownValue(row[i]);
            if (maxWidth && value.length > maxWidth) {
                value = value.slice(0, maxWidth - 3) + "...";
            }
            return value;
        });
        lines.push("| " + values.join(" | ") + " |");
    }

    return lines.join("\n");
}

/**
 * Format TOON value for Markdown
 */
function formatMarkdownValue(value: ToonValue): string {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) {
        return value.map((v) => formatMarkdownValue(v)).join(", ");
    }
    if (typeof value === "object") {
        if ("$r" in value) return `\`${value.$r}\``;
        return "`object`";
    }
    // Escape pipe characters
    return String(value).replace(/\|/g, "\\|");
}

/**
 * Download TOON as Markdown file
 */
export function downloadToonAsMarkdown<T extends Record<string, any>>(
    toon: ToonDocument<T>,
    filename: string = "export.md",
    options: ToonToMarkdownOptions = {}
): void {
    const markdown = toonToMarkdown(toon, options);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
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
    markdownToToon,
    toonToMarkdown,
    downloadToonAsMarkdown,
};
