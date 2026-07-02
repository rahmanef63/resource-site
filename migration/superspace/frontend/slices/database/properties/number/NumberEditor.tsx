import React, { useState, useEffect } from 'react';
import { PropertyEditorProps } from '../../registry/types';
import { Input } from '@/components/ui/input';
import { ValidationDialog } from '../../components/ValidationDialog';

export const NumberEditor: React.FC<PropertyEditorProps> = ({ value, onChange }) => {
  
  const [localValue, setLocalValue] = useState(
    value !== null && value !== undefined ? String(value) : ''
  );
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const displayValue = value !== null && value !== undefined ? String(value) : '';
    setLocalValue(displayValue);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty value
    if (newValue === '') {
      setLocalValue('');
      onChange(null);
      return;
    }

    // Allow intermediate states while typing (e.g., "-", ".", "-.")
    // These are valid intermediate states but not complete numbers
    const intermediatePattern = /^-?$|^-?\.$|^\.$/;
    if (intermediatePattern.test(newValue)) {
      setLocalValue(newValue);
      // Don't call onChange yet - wait for complete number
      return;
    }

    // Validate: only allow numbers, comma, dot, and minus sign
    // Pattern allows: -123, 123.45, -123.45, 1,234.56, etc.
    const validPattern = /^-?[\d,]*\.?\d*$/;
    
    if (!validPattern.test(newValue)) {
      setValidationMessage('Input tidak valid. Hanya angka, koma (,), dan titik (.) yang diperbolehkan.');
      setShowValidationDialog(true);
      return;
    }
    setLocalValue(newValue);

    // Remove commas for parsing (treat comma as thousand separator)
    const cleanValue = newValue.replace(/,/g, '');
    const numValue = Number(cleanValue);
    
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
    // Don't show validation dialog for intermediate parsing states
  };

  const handleBlur = () => {
    // Format the number on blur (optional - adds thousand separators)
    if (localValue && localValue !== '') {
      const cleanValue = localValue.replace(/,/g, '');
      const numValue = Number(cleanValue);
      
      if (!isNaN(numValue)) {
        // Format with thousand separators
        const formatted = numValue.toLocaleString('id-ID');
        setLocalValue(formatted);
      }
    }
  };

  return (
    <>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Masukkan angka..."
        className="font-mono"
      />
      
      <ValidationDialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}
        title="Input Tidak Valid"
        description={validationMessage}
      />
    </>
  );
};
