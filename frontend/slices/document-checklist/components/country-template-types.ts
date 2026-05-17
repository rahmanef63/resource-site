export interface TemplateSummary {
  _id: string
  country: string
  countryLabel: string
  flag?: string
  description?: string
  documentCount: number
  requiredCount: number
}

export interface TemplateDoc {
  id: string
  title: string
  description: string
  category: string
  required: boolean
  issuingAuthority?: string
  validityYears?: number
}

export interface TemplateFull {
  country: string
  countryLabel: string
  flag?: string
  description?: string
  documents: TemplateDoc[]
}

/**
 * Bindings for the country-template card. Consumer wires Convex
 * queries + mutations into these slots — slice stays portable.
 */
export interface CountryTemplateBindings {
  /** `undefined` = loading, list otherwise. */
  templates: TemplateSummary[] | undefined
  /** Full payload for the previewed country, or `null` when none / loading. */
  getTemplate: (country: string | null) => TemplateFull | null | undefined
  /** Idempotent — merges template into user's checklist row. */
  instantiate: (args: {
    country: string
  }) => Promise<{ inserted: number; preserved: number }>
}
