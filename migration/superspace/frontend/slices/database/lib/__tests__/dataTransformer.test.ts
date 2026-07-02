/**
 * Change Property Type Feature Tests
 * Tests data transformation logic and type conversions
 */

import { describe, it, expect } from 'vitest';
import {
  transformTextToNumber,
  transformNumberToText,
  transformTextToSelect,
  transformSelectToText,
  transformSelectToMultiSelect,
  transformMultiSelectToSelect,
  transformCheckboxToText,
  transformTextToCheckbox,
  transformDateToText,
  transformTextToDate,
  transformPropertyValue,
  transformPropertyData,
  isLossyConversion,
  getTransformationDescription,
} from '../dataTransformer';

describe('Data Transformer - Individual Functions', () => {
  describe('Text to Number Conversion', () => {
    it('should convert valid numeric string to number', () => {
      expect(transformTextToNumber('123')).toBe(123);
      expect(transformTextToNumber('45.67')).toBe(45.67);
      expect(transformTextToNumber('-10')).toBe(-10);
      expect(transformTextToNumber('0')).toBe(0);
    });

    it('should strip letters from mixed strings', () => {
      // NEW BEHAVIOR: Extract numbers from mixed strings
      expect(transformTextToNumber('12abc')).toBe(12);
      expect(transformTextToNumber('abc123')).toBe(123);
      expect(transformTextToNumber('price: $45.67')).toBe(45.67);
      
      // Pure text returns null
      expect(transformTextToNumber('abc')).toBeNull();
      expect(transformTextToNumber('hello')).toBeNull();
    });

    it('should return null for empty/null/undefined', () => {
      expect(transformTextToNumber('')).toBeNull();
      expect(transformTextToNumber(null)).toBeNull();
      expect(transformTextToNumber(undefined)).toBeNull();
    });
  });

  describe('Number to Text Conversion', () => {
    it('should convert numbers to strings', () => {
      expect(transformNumberToText(123)).toBe('123');
      expect(transformNumberToText(45.67)).toBe('45.67');
      expect(transformNumberToText(-10)).toBe('-10');
      expect(transformNumberToText(0)).toBe('0');
    });

    it('should handle null/undefined', () => {
      expect(transformNumberToText(null)).toBe('');
      expect(transformNumberToText(undefined)).toBe('');
    });
  });

  describe('Text to Select Conversion', () => {
    it('should split comma-separated values', () => {
      expect(transformTextToSelect('red, blue, green')).toEqual(['red', 'blue', 'green']);
      expect(transformTextToSelect('option1,option2,option3')).toEqual(['option1', 'option2', 'option3']);
    });

    it('should trim whitespace', () => {
      expect(transformTextToSelect('  red  ,  blue  ')).toEqual(['red', 'blue']);
    });

    it('should filter empty values', () => {
      expect(transformTextToSelect('red,,blue')).toEqual(['red', 'blue']);
      expect(transformTextToSelect(',,')).toEqual([]);
    });

    it('should return empty array for empty/null/undefined', () => {
      expect(transformTextToSelect('')).toEqual([]);
      expect(transformTextToSelect(null)).toEqual([]);
      expect(transformTextToSelect(undefined)).toEqual([]);
    });
  });

  describe('Select to Text Conversion', () => {
    it('should join array with comma', () => {
      expect(transformSelectToText(['red', 'blue', 'green'])).toBe('red, blue, green');
      expect(transformSelectToText(['option1', 'option2'])).toBe('option1, option2');
    });

    it('should handle single value', () => {
      expect(transformSelectToText('single')).toBe('single');
    });

    it('should handle empty/null/undefined', () => {
      expect(transformSelectToText([])).toBe('');
      expect(transformSelectToText(null)).toBe('');
      expect(transformSelectToText(undefined)).toBe('');
    });
  });

  describe('Select ↔ MultiSelect Conversion', () => {
    it('should convert select to multiselect (single to array)', () => {
      expect(transformSelectToMultiSelect('option1')).toEqual(['option1']);
      expect(transformSelectToMultiSelect(['option1'])).toEqual(['option1']);
    });

    it('should convert multiselect to select (keep first)', () => {
      expect(transformMultiSelectToSelect(['option1', 'option2', 'option3'])).toBe('option1');
      expect(transformMultiSelectToSelect(['single'])).toBe('single');
    });

    it('should handle empty values', () => {
      expect(transformSelectToMultiSelect(null)).toEqual([]);
      expect(transformMultiSelectToSelect([])).toBeNull();
    });
  });

  describe('Checkbox ↔ Text Conversion', () => {
    it('should convert checkbox to text', () => {
      expect(transformCheckboxToText(true)).toBe('Yes');
      expect(transformCheckboxToText(false)).toBe('No');
      expect(transformCheckboxToText(null)).toBe('');
    });

    it('should convert text to checkbox', () => {
      expect(transformTextToCheckbox('yes')).toBe(true);
      expect(transformTextToCheckbox('YES')).toBe(true);
      expect(transformTextToCheckbox('true')).toBe(true);
      expect(transformTextToCheckbox('1')).toBe(true);
      expect(transformTextToCheckbox('checked')).toBe(true);
      expect(transformTextToCheckbox('on')).toBe(true);
      
      expect(transformTextToCheckbox('no')).toBe(false);
      expect(transformTextToCheckbox('false')).toBe(false);
      expect(transformTextToCheckbox('0')).toBe(false);
      expect(transformTextToCheckbox('')).toBe(false);
    });
  });

  describe('Date ↔ Text Conversion', () => {
    it('should convert date to text (YYYY-MM-DD)', () => {
      const date = new Date('2024-01-15T12:30:00');
      expect(transformDateToText(date.getTime())).toBe('2024-01-15');
    });

    it('should convert text to date', () => {
      const result = transformTextToDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(new Date(result!).getFullYear()).toBe(2024);
      expect(new Date(result!).getMonth()).toBe(0); // January
      expect(new Date(result!).getDate()).toBe(15);
    });

    it('should handle invalid dates', () => {
      expect(transformTextToDate('invalid-date')).toBeNull();
      expect(transformDateToText('invalid')).toBe('');
    });
  });
});

describe('Data Transformer - Main Dispatcher', () => {
  it('should handle same type (no transformation)', () => {
    expect(transformPropertyValue('text', 'text', 'hello')).toBe('hello');
    expect(transformPropertyValue('number', 'number', 123)).toBe(123);
  });

  it('should route text conversions correctly', () => {
    expect(transformPropertyValue('text', 'number', '123')).toBe(123);
    expect(transformPropertyValue('text', 'select', 'a,b,c')).toEqual(['a', 'b', 'c']);
    expect(transformPropertyValue('text', 'checkbox', 'yes')).toBe(true);
  });

  it('should route number conversions correctly', () => {
    expect(transformPropertyValue('number', 'text', 123)).toBe('123');
    expect(transformPropertyValue('number', 'checkbox', 5)).toBe(true);
    expect(transformPropertyValue('number', 'checkbox', 0)).toBe(false);
  });

  it('should route select conversions correctly', () => {
    expect(transformPropertyValue('select', 'text', ['a', 'b'])).toBe('a, b');
    expect(transformPropertyValue('select', 'multiSelect', 'option')).toEqual(['option']);
  });

  it('should route multiselect conversions correctly', () => {
    expect(transformPropertyValue('multiSelect', 'text', ['a', 'b', 'c'])).toBe('a, b, c');
    expect(transformPropertyValue('multiSelect', 'select', ['a', 'b'])).toBe('a');
  });
});

describe('Data Transformer - Batch Processing', () => {
  it('should transform array of values successfully', () => {
    const result = transformPropertyData({
      fromType: 'text',
      toType: 'number',
      data: ['123', '456', '789'],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([123, 456, 789]);
    expect(result.warnings).toBeUndefined();
    expect(result.invalidRows).toBeUndefined();
  });

  it('should track invalid conversions', () => {
    const result = transformPropertyData({
      fromType: 'text',
      toType: 'number',
      data: ['123', 'abc', '456', 'xyz'],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([123, null, 456, null]);
    expect(result.invalidRows).toEqual([1, 3]); // 0-indexed
    expect(result.warnings).toBeTruthy();
    expect(result.warnings![0]).toContain('2 of 4 values could not be converted');
  });

  it('should handle empty data array', () => {
    const result = transformPropertyData({
      fromType: 'text',
      toType: 'number',
      data: [],
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  it('should validate data is array', () => {
    const result = transformPropertyData({
      fromType: 'text',
      toType: 'number',
      data: 'not an array' as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Data must be an array of rows');
  });
});

describe('Data Transformer - Lossy Conversion Detection', () => {
  it('should identify lossy conversions', () => {
    expect(isLossyConversion('multiSelect', 'select')).toBe(true);
    expect(isLossyConversion('number', 'text')).toBe(true);
    expect(isLossyConversion('date', 'text')).toBe(true);
    expect(isLossyConversion('url', 'text')).toBe(true);
    expect(isLossyConversion('email', 'text')).toBe(true);
  });

  it('should identify non-lossy conversions', () => {
    expect(isLossyConversion('text', 'number')).toBe(false);
    expect(isLossyConversion('text', 'select')).toBe(false);
    expect(isLossyConversion('select', 'multiSelect')).toBe(false);
    expect(isLossyConversion('number', 'checkbox')).toBe(false);
  });
});

describe('Data Transformer - Transformation Descriptions', () => {
  it('should provide description for common conversions', () => {
    const desc1 = getTransformationDescription('text', 'number');
    expect(desc1).toContain('Parse numeric values');
    expect(desc1).toContain('123');

    const desc2 = getTransformationDescription('text', 'select');
    expect(desc2).toContain('Split by comma');
    expect(desc2).toContain('red, blue');

    const desc3 = getTransformationDescription('multiSelect', 'select');
    expect(desc3).toContain('first selected option');
    expect(desc3).toContain('lost');
  });

  it('should handle same type', () => {
    const desc = getTransformationDescription('text', 'text');
    expect(desc).toBe('No transformation needed');
  });

  it('should provide fallback description', () => {
    const desc = getTransformationDescription('person' as any, 'file' as any);
    expect(desc).toContain('Convert from');
  });
});

describe('Data Transformer - Reversibility Tests', () => {
  it('should preserve data on Text ↔ Number (valid numbers)', () => {
    const original = '123';
    const toNumber = transformPropertyValue('text', 'number', original);
    const backToText = transformPropertyValue('number', 'text', toNumber);
    expect(backToText).toBe(original);
  });

  it('should preserve data on Text ↔ Select', () => {
    const original = 'red, blue, green';
    const toSelect = transformPropertyValue('text', 'select', original);
    const backToText = transformPropertyValue('select', 'text', toSelect);
    expect(backToText).toBe(original);
  });

  it('should preserve data on Select ↔ MultiSelect (single value)', () => {
    const original = 'option1';
    const toMulti = transformPropertyValue('select', 'multiSelect', original);
    const backToSelect = transformPropertyValue('multiSelect', 'select', toMulti);
    expect(backToSelect).toBe(original);
  });

  it('should preserve data on Checkbox ↔ Text', () => {
    const original = true;
    const toText = transformPropertyValue('checkbox', 'text', original);
    const backToCheckbox = transformPropertyValue('text', 'checkbox', toText);
    expect(backToCheckbox).toBe(original);
  });

  it('should NOT preserve data on MultiSelect → Select (lossy)', () => {
    const original = ['option1', 'option2', 'option3'];
    const toSelect = transformPropertyValue('multiSelect', 'select', original);
    expect(toSelect).toBe('option1'); // Only first is kept
    
    const backToMulti = transformPropertyValue('select', 'multiSelect', toSelect);
    expect(backToMulti).toEqual(['option1']); // Lost option2 and option3
  });
});

describe('Data Transformer - Edge Cases', () => {
  it('should handle null and undefined consistently', () => {
    expect(transformPropertyValue('text', 'number', null)).toBeNull();
    expect(transformPropertyValue('text', 'number', undefined)).toBeNull();
    expect(transformPropertyValue('text', 'select', null)).toEqual([]);
    expect(transformPropertyValue('number', 'text', null)).toBe('');
  });

  it('should handle empty strings', () => {
    expect(transformPropertyValue('text', 'number', '')).toBeNull();
    expect(transformPropertyValue('text', 'select', '')).toEqual([]);
    expect(transformPropertyValue('text', 'checkbox', '')).toBe(false);
  });

  it('should handle whitespace-only strings', () => {
    // Note: Number('   ') returns 0 in JavaScript, not NaN
    expect(transformPropertyValue('text', 'number', '   ')).toBe(0);
    expect(transformPropertyValue('text', 'select', '   ')).toEqual([]);
  });

  it('should handle special numeric formats', () => {
    expect(transformPropertyValue('text', 'number', '+123')).toBe(123);
    expect(transformPropertyValue('text', 'number', '-456')).toBe(-456);
    expect(transformPropertyValue('text', 'number', '1.23e2')).toBe(123);
    expect(transformPropertyValue('text', 'number', 'Infinity')).toBe(Infinity);
  });

  it('should handle arrays in text conversion', () => {
    expect(transformPropertyValue('select', 'text', [])).toBe('');
    expect(transformPropertyValue('multiSelect', 'text', [])).toBe('');
  });
});
