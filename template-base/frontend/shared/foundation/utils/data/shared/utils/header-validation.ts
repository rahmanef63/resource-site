/**
 * Header Validation Utilities
 * 
 * Provides fuzzy matching and header validation for import field mapping.
 */

import type {
    FieldMapping,
    HeaderValidationResult,
} from "../types/transfer-types";
import type { ExportProperty } from "../types/data-export-types";

// ============================================================================
// String Similarity (Levenshtein Distance)
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1) between two strings
 */
function stringSimilarity(a: string, b: string): number {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();

    if (aLower === bLower) return 1;
    if (aLower.length === 0 || bLower.length === 0) return 0;

    const distance = levenshteinDistance(aLower, bLower);
    const maxLength = Math.max(aLower.length, bLower.length);

    return 1 - distance / maxLength;
}

// ============================================================================
// Header Normalization
// ============================================================================

/**
 * Normalize a header string for comparison
 */
function normalizeHeader(header: string): string {
    return header
        .toLowerCase()
        .trim()
        .replace(/[_\-\s]+/g, "") // Remove underscores, hyphens, spaces
        .replace(/[^a-z0-9]/g, ""); // Remove special characters
}

// ============================================================================
// Header Validation
// ============================================================================

/**
 * Validate import headers against expected properties
 */
export function validateHeaders(
    sourceHeaders: string[],
    targetProperties: ExportProperty[],
    options: {
        fuzzyThreshold?: number;  // Min similarity for fuzzy match (default: 0.7)
        requireAllRequired?: boolean;  // Fail if any required field missing
    } = {}
): HeaderValidationResult {
    const {
        fuzzyThreshold = 0.7,
        requireAllRequired = true
    } = options;

    const mappings: FieldMapping[] = [];
    const unmappedHeaders: string[] = [];
    const warnings: string[] = [];
    const suggestions: Record<string, string[]> = {};

    // Track which target properties have been mapped
    const mappedTargets = new Set<string>();

    // Process each source header
    for (const header of sourceHeaders) {
        const normalizedHeader = normalizeHeader(header);

        // 1. Try exact match (case-insensitive)
        let exactMatch = targetProperties.find(
            p => p.key.toLowerCase() === header.toLowerCase() ||
                p.label.toLowerCase() === header.toLowerCase()
        );

        // 2. Try normalized exact match
        if (!exactMatch) {
            exactMatch = targetProperties.find(
                p => normalizeHeader(p.key) === normalizedHeader ||
                    normalizeHeader(p.label) === normalizedHeader
            );
        }

        if (exactMatch && !mappedTargets.has(exactMatch.key)) {
            mappings.push({
                sourceHeader: header,
                targetProperty: exactMatch.key,
                matchType: "exact",
                confidence: 1,
                required: exactMatch.required,
            });
            mappedTargets.add(exactMatch.key);
            continue;
        }

        // 3. Try fuzzy match
        let bestMatch: { property: ExportProperty; score: number } | null = null;
        const possibleMatches: string[] = [];

        for (const prop of targetProperties) {
            if (mappedTargets.has(prop.key)) continue;

            const keyScore = stringSimilarity(header, prop.key);
            const labelScore = stringSimilarity(header, prop.label);
            const score = Math.max(keyScore, labelScore);

            if (score >= fuzzyThreshold) {
                possibleMatches.push(prop.label);
                if (!bestMatch || score > bestMatch.score) {
                    bestMatch = { property: prop, score };
                }
            }
        }

        if (bestMatch && bestMatch.score >= fuzzyThreshold) {
            mappings.push({
                sourceHeader: header,
                targetProperty: bestMatch.property.key,
                matchType: "fuzzy",
                confidence: bestMatch.score,
                required: bestMatch.property.required,
            });
            mappedTargets.add(bestMatch.property.key);

            // Add suggestions if multiple good matches
            if (possibleMatches.length > 1) {
                suggestions[header] = possibleMatches;
                warnings.push(`"${header}" fuzzy-matched to "${bestMatch.property.label}" (${Math.round(bestMatch.score * 100)}% confidence)`);
            }
        } else {
            // No match found
            mappings.push({
                sourceHeader: header,
                targetProperty: null,
                matchType: "unmapped",
                required: false,
            });
            unmappedHeaders.push(header);

            // Find any potential suggestions
            const allSuggestions = targetProperties
                .filter(p => !mappedTargets.has(p.key))
                .map(p => ({
                    label: p.label,
                    score: Math.max(stringSimilarity(header, p.key), stringSimilarity(header, p.label)),
                }))
                .filter(s => s.score >= 0.3)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)
                .map(s => s.label);

            if (allSuggestions.length > 0) {
                suggestions[header] = allSuggestions;
            }
        }
    }

    // Check for missing required fields
    const missingRequiredFields = targetProperties
        .filter(p => p.required && !mappedTargets.has(p.key))
        .map(p => p.label);

    if (missingRequiredFields.length > 0) {
        warnings.push(`Missing required fields: ${missingRequiredFields.join(", ")}`);
    }

    // Determine overall validity
    const isValid = requireAllRequired
        ? missingRequiredFields.length === 0
        : true;

    return {
        mappings,
        unmappedHeaders,
        missingRequiredFields,
        isValid,
        warnings,
        suggestions,
    };
}

/**
 * Suggest best matches for an unmapped header
 */
export function suggestMappings(
    header: string,
    availableProperties: ExportProperty[],
    maxSuggestions: number = 5
): Array<{ property: string; label: string; confidence: number }> {
    return availableProperties
        .map(prop => ({
            property: prop.key,
            label: prop.label,
            confidence: Math.max(
                stringSimilarity(header, prop.key),
                stringSimilarity(header, prop.label)
            ),
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxSuggestions);
}

/**
 * Apply user corrections to mappings
 */
export function applyManualMapping(
    mappings: FieldMapping[],
    sourceHeader: string,
    targetProperty: string | null
): FieldMapping[] {
    return mappings.map(m => {
        if (m.sourceHeader === sourceHeader) {
            return {
                ...m,
                targetProperty,
                matchType: targetProperty ? "manual" : "unmapped",
                confidence: targetProperty ? 1 : undefined,
            };
        }
        return m;
    });
}

export default { validateHeaders, suggestMappings, applyManualMapping };
