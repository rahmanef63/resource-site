// Pure helpers for document-checklist mutations. Split out of `mutations.ts`
// (LOC cap). Keep in pure-TS module (no Convex runtime imports) so the file
// stays test-friendly.

export const MAX_TYPE_LEN = 50;
export const MAX_COUNTRY_LEN = 100;
export const MAX_ID_LEN = 100;
export const MAX_NAME_LEN = 200;
export const MAX_CATEGORY_LEN = 50;
export const MAX_SUBCATEGORY_LEN = 50;
export const MAX_NOTES_LEN = 2000;
export const MAX_DATE_LEN = 32;
export const MAX_DOCS = 200;

export function trimLen(field: string, value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) {
    throw new Error(`${field} 1-${max} karakter`);
  }
  return trimmed;
}

// Shape of a document item stored on the checklist row.
export type ChecklistDoc = {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  required: boolean;
  completed: boolean;
  notes: string;
  expiryDate?: string;
};

/**
 * Normalize + validate the inbound template payload for `seed`. Returns
 * a fresh list with `completed=false` / `notes=""`. Caller must merge
 * any prior state on top.
 */
export function normalizeSeedTemplate(
  template: Array<{
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    required: boolean;
  }>,
): ChecklistDoc[] {
  return template.map((doc) => ({
    id: trimLen("ID dokumen", doc.id, MAX_ID_LEN),
    name: trimLen("Nama dokumen", doc.name, MAX_NAME_LEN),
    category: trimLen("Kategori", doc.category, MAX_CATEGORY_LEN),
    subcategory: doc.subcategory
      ? trimLen("Subkategori", doc.subcategory, MAX_SUBCATEGORY_LEN)
      : undefined,
    required: doc.required,
    completed: false,
    notes: "",
  }));
}

/**
 * Merge `prior` checklist state onto `next` by document id. Preserves
 * completed/notes/expiry on matching ids; drops priors without a match
 * (template no longer ships them).
 */
export function mergePriorChecklist(
  next: ChecklistDoc[],
  prior: ReadonlyArray<ChecklistDoc>,
): ChecklistDoc[] {
  const priorMap = new Map(prior.map((d) => [d.id, d]));
  return next.map((doc) => {
    const old = priorMap.get(doc.id);
    if (!old) return doc;
    return {
      ...doc,
      completed: old.completed,
      notes: old.notes,
      expiryDate: old.expiryDate,
    };
  });
}

/** Whole-number percent of `completed=true` docs out of `docs.length`. */
export function computeProgress(docs: ReadonlyArray<ChecklistDoc>): number {
  if (docs.length === 0) return 0;
  const done = docs.filter((d) => d.completed).length;
  return Math.round((done / docs.length) * 100);
}

// A row from the master `document_checklist_templates` table.
export type TemplateDoc = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  required: boolean;
};

/**
 * Apply a status patch to the matching doc in `docs`. Returns the new list
 * and a `touched` flag — callers should error when `touched === false`.
 */
export function applyDocStatus(
  docs: ReadonlyArray<ChecklistDoc>,
  documentId: string,
  patch: { completed: boolean; notes?: string; expiryDate?: string },
): { documents: ChecklistDoc[]; touched: boolean } {
  let touched = false;
  const documents = docs.map((doc) => {
    if (doc.id !== documentId) return doc;
    touched = true;
    return {
      ...doc,
      completed: patch.completed,
      notes: patch.notes !== undefined ? patch.notes : doc.notes,
      expiryDate: patch.expiryDate !== undefined ? patch.expiryDate : doc.expiryDate,
    };
  });
  return { documents, touched };
}

/**
 * Map a country-template's documents onto a personal checklist, preserving
 * prior `completed` / `notes` / `expiryDate` by id. Returns the merged
 * doc list plus a count of how many were preserved from the prior row.
 */
export function mergeTemplateForInstantiate(
  templateDocs: ReadonlyArray<TemplateDoc>,
  prior: ReadonlyArray<ChecklistDoc>,
): { documents: ChecklistDoc[]; preserved: number } {
  const priorMap = new Map(prior.map((d) => [d.id, d]));
  let preserved = 0;
  const documents = templateDocs.map((td) => {
    const old = priorMap.get(td.id);
    if (old) {
      preserved++;
      return {
        id: td.id,
        name: td.title,
        category: td.category,
        subcategory: td.subcategory,
        required: td.required,
        completed: old.completed,
        notes: old.notes,
        expiryDate: old.expiryDate,
      };
    }
    return {
      id: td.id,
      name: td.title,
      category: td.category,
      subcategory: td.subcategory,
      required: td.required,
      completed: false,
      notes: "",
    };
  });
  return { documents, preserved };
}
