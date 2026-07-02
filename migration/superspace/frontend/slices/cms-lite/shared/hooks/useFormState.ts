import { useState, useCallback, ChangeEvent } from 'react';

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type UseFormStateOptions<T> = {
  initialValues: T;
  validate?: (values: T) => FormErrors<T>;
  onSubmit: (values: T) => Promise<void> | void;
};

export type UseFormStateReturn<T> = {
  values: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleInputChange: (field: keyof T) => (value: string) => void;
  handleCheckboxChange: (field: keyof T) => (e: ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: keyof T) => (value: string) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setValues: (values: T) => void;
  setErrors: (errors: FormErrors<T>) => void;
  resetForm: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
};

export function useFormState<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleInputChange = useCallback((field: keyof T) => {
    return (value: string) => handleChange(field, value as T[keyof T]);
  }, [handleChange]);

  const handleCheckboxChange = useCallback((field: keyof T) => {
    return (e: ChangeEvent<HTMLInputElement>) => handleChange(field, e.target.checked as T[keyof T]);
  }, [handleChange]);

  const handleSelectChange = useCallback((field: keyof T) => {
    return (value: string) => handleChange(field, value as T[keyof T]);
  }, [handleChange]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    handleChange(field, value);
  }, [handleChange]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validateField = useCallback((field: keyof T): boolean => {
    if (!validate) return true;
    
    const fieldErrors = validate(values);
    if (fieldErrors[field]) {
      setFieldError(field, fieldErrors[field]!);
      return false;
    }
    return true;
  }, [values, validate, setFieldError]);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsDirty(false);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    handleChange,
    handleInputChange,
    handleCheckboxChange,
    handleSelectChange,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    handleSubmit,
    validateField,
    validateForm,
  };
}

export function useFieldArray<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const append = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const prepend = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
  }, []);

  const move = useCallback((from: number, to: number) => {
    setItems(prev => {
      const next = [...prev];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    setItems,
    append,
    prepend,
    remove,
    update,
    move,
    clear,
  };
}
