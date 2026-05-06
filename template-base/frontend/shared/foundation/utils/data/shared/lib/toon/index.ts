/**
 * TOON Module - Token-Optimized Object Notation
 * 
 * A compact data format for efficient storage and transmission.
 */

// Types
export type {
    ToonDocument,
    ToonValue,
    ToonSchema,
    ToonSchemaField,
    ToonMeta,
    ToonFieldType,
    ToonParseOptions,
    ToonSerializeOptions,
    ToonValidationResult,
    ToonValidationError,
} from "./types";

export {
    isToonDocument,
    isToonReference,
    toToonType,
    fromToonType,
} from "./types";

// Parser
export {
    parseToon,
    parseRow,
    parseValue,
    getToonMeta,
    getToonRecord,
    findToonRecords,
} from "./parser";

// Serializer
export {
    serializeToToon,
    extractKeys,
    compactValues,
    serializeValue,
    addToToon,
    updateToonRecord,
    removeFromToon,
    stringifyToon,
    stringifyToonPretty,
    inferSchema,
} from "./serializer";

// Validator
export {
    validateToon,
    validateAgainstSchema,
    validateFieldValue,
    isValueTypeValid,
    createSchema,
    mergeSchemas,
    getRequiredFields,
    hasSchemaField,
} from "./validator";
