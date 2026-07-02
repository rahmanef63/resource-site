import { useState, useCallback } from 'react';

export type MultiLanguageField<T = string> = {
  en: T;
  pt: T;
  ar?: T;
  id?: T;
};

export type UseMultiLanguageFormOptions<T> = {
  initialValues: T;
  supportedLanguages?: string[];
};

export function useMultiLanguageForm<T extends Record<string, any>>({
  initialValues,
  supportedLanguages = ['en', 'pt'],
}: UseMultiLanguageFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [currentLanguage, setCurrentLanguage] = useState(supportedLanguages[0]);

  const setMultiLanguageField = useCallback(
    <K extends keyof T>(field: K, language: string, value: unknown) => {
      setValues(prev => ({
        ...prev,
        [field]: {
          ...(typeof prev[field] === 'object' && prev[field] !== null ? prev[field] : {}),
          [language]: value,
        } as T[K],
      }));
    },
    []
  );

  const getFieldValue = useCallback(
    <K extends keyof T>(field: K, language?: string): unknown => {
      const fieldValue = values[field];
      if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
        return (fieldValue as Record<string, unknown>)[language || currentLanguage];
      }
      return fieldValue;
    },
    [values, currentLanguage]
  );

  const validateMultiLanguageField = useCallback(
    <K extends keyof T>(field: K, required: boolean = true): string | null => {
      const fieldValue = values[field];
      
      if (typeof fieldValue !== 'object' || fieldValue === null || Array.isArray(fieldValue)) {
        return null;
      }

      const multiLangValue = fieldValue as Record<string, unknown>;
      for (const lang of supportedLanguages) {
        const value = multiLangValue[lang];
        if (required && (!value || String(value).trim() === '')) {
          return `${String(field)} is required in ${lang.toUpperCase()}`;
        }
      }

      return null;
    },
    [values, supportedLanguages]
  );

  const hasAllTranslations = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const fieldValue = values[field];
      
      if (typeof fieldValue !== 'object' || fieldValue === null || Array.isArray(fieldValue)) {
        return false;
      }

      const multiLangValue = fieldValue as Record<string, unknown>;
      return supportedLanguages.every(
        lang => multiLangValue[lang] && String(multiLangValue[lang]).trim() !== ''
      );
    },
    [values, supportedLanguages]
  );

  const getMissingTranslations = useCallback(
    <K extends keyof T>(field: K): string[] => {
      const fieldValue = values[field];
      
      if (typeof fieldValue !== 'object' || fieldValue === null || Array.isArray(fieldValue)) {
        return supportedLanguages;
      }

      const multiLangValue = fieldValue as Record<string, unknown>;
      return supportedLanguages.filter(
        lang => !multiLangValue[lang] || String(multiLangValue[lang]).trim() === ''
      );
    },
    [values, supportedLanguages]
  );

  const copyFromLanguage = useCallback(
    <K extends keyof T>(field: K, fromLang: string, toLang: string) => {
      const fieldValue = values[field];
      
      if (typeof fieldValue === 'object' && fieldValue !== null && !Array.isArray(fieldValue)) {
        const multiLangValue = fieldValue as Record<string, unknown>;
        if (multiLangValue[fromLang]) {
          setMultiLanguageField(field, toLang, multiLangValue[fromLang]);
        }
      }
    },
    [values, setMultiLanguageField]
  );

  return {
    values,
    setValues,
    currentLanguage,
    setCurrentLanguage,
    supportedLanguages,
    setMultiLanguageField,
    getFieldValue,
    validateMultiLanguageField,
    hasAllTranslations,
    getMissingTranslations,
    copyFromLanguage,
  };
}

export function createMultiLanguageField<T = string>(
  defaultValue: T,
  languages: string[] = ['en', 'pt']
): MultiLanguageField<T> {
  return languages.reduce((acc, lang) => {
    acc[lang as keyof MultiLanguageField<T>] = defaultValue;
    return acc;
  }, {} as MultiLanguageField<T>);
}

export function isMultiLanguageFieldComplete<T>(
  field: MultiLanguageField<T>,
  languages: string[] = ['en', 'pt']
): boolean {
  return languages.every(lang => {
    const value = field[lang as keyof MultiLanguageField<T>];
    return value !== undefined && value !== null && value !== '';
  });
}

export function getCompletedLanguages<T>(
  field: MultiLanguageField<T>,
  languages: string[] = ['en', 'pt']
): string[] {
  return languages.filter(lang => {
    const value = field[lang as keyof MultiLanguageField<T>];
    return value !== undefined && value !== null && value !== '';
  });
}
