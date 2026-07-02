export function getLocalizedValue<T extends Record<string, any>>(
  obj: T,
  field: string,
  locale: "id" | "en" | "ar"
): string {
  const key = `${field}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
  return obj[key] || obj[`${field}En`] || "";
}

export function createLocalizedObject(
  field: string,
  values: { id: string; en: string; ar: string }
) {
  return {
    [`${field}Id`]: values.id,
    [`${field}En`]: values.en,
    [`${field}Ar`]: values.ar,
  };
}
