/**
 * Property Type Transformations for Convex
 * 
 * Server-side transformation logic that converts data when property types change.
 * This is a Convex-compatible version without frontend dependencies.
 */

/**
 * Transform value from one type to another
 */
export function transformValue(
  fromType: string,
  toType: string,
  value: any,
  options?: Array<{ id: string; name: string; color?: string }>
): {
  value: any;
  success: boolean;
  warning?: string;
  newOptions?: Array<{ id: string; name: string; color: string }>;
} {
  // Same type = no transformation
  if (fromType === toType) {
    return { value, success: true };
  }

  // Text types are interchangeable
  const textTypes = ['text', 'title', 'rich_text'];
  if (textTypes.includes(fromType) && textTypes.includes(toType)) {
    return { value, success: true };
  }

  // TO TEXT/RICH_TEXT/TITLE
  if (textTypes.includes(toType)) {
    return transformToText(fromType, value, options);
  }

  // TO NUMBER
  if (toType === 'number') {
    return transformToNumber(fromType, value, options);
  }

  // TO SELECT
  if (toType === 'select') {
    return transformToSelect(fromType, value, options);
  }

  // TO MULTI_SELECT
  if (toType === 'multiSelect' || toType === 'multi_select') {
    return transformToMultiSelect(fromType, value);
  }

  // TO CHECKBOX
  if (toType === 'checkbox') {
    return transformToCheckbox(fromType, value, options);
  }

  // TO DATE
  if (toType === 'date') {
    return transformToDate(fromType, value);
  }

  // TO URL
  if (toType === 'url') {
    return transformToUrl(fromType, value);
  }

  // TO EMAIL
  if (toType === 'email') {
    return transformToEmail(fromType, value);
  }

  // TO PHONE
  if (toType === 'phone') {
    return transformToPhone(fromType, value);
  }

  // No transformation available
  return {
    value: null,
    success: false,
    warning: `No transformation from ${fromType} to ${toType}`,
  };
}

/**
 * Transform to text type
 */
function transformToText(
  fromType: string,
  value: any,
  options?: Array<{ id: string; name: string; color?: string }>
): any {
  if (value === null || value === undefined) {
    return { value: '', success: true };
  }

  switch (fromType) {
    case 'number':
      return { value: String(value), success: true };
    
    case 'checkbox':
      return { value: value ? 'Yes' : 'No', success: true };
    
    case 'date':
      return { value: new Date(value).toLocaleDateString(), success: true };
    
    case 'select': {
      const option = options?.find(o => o.id === value);
      return { value: option?.name || value, success: true };
    }
    
    case 'multiSelect':
    case 'multi_select': {
      if (!Array.isArray(value)) return { value: '', success: true };
      const labels = value.map(id => {
        const option = options?.find(o => o.id === id);
        return option?.name || id;
      });
      return { value: labels.join(', '), success: true };
    }
    
    case 'url':
    case 'email':
    case 'phone':
      return { value: String(value), success: true };
    
    case 'person':
    case 'people': {
      if (Array.isArray(value)) {
        return {
          value: value.join(', '),
          success: true,
          warning: 'User references converted to text',
        };
      }
      return { value: String(value), success: true };
    }
    
    case 'files': {
      if (Array.isArray(value)) {
        return {
          value: value.map(f => f.name || f.url || '').join(', '),
          success: true,
          warning: 'File attachments converted to text',
        };
      }
      return { value: '', success: true };
    }
    
    default:
      return { value: String(value), success: true };
  }
}

/**
 * Transform to number type
 */
function transformToNumber(fromType: string, value: any, options?: any[]): any {
  if (value === null || value === undefined || value === '') {
    return { value: null, success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const str = String(value).trim();
      const match = str.match(/-?\d+\.?\d*/);
      const num = match ? parseFloat(match[0]) : 0;
      return {
        value: num,
        success: !!match,
        warning: !match ? 'No numbers found, defaulting to 0' : undefined,
      };
    }
    
    case 'checkbox':
      return { value: value ? 1 : 0, success: true };
    
    case 'select': {
      const option = options?.find((o: any) => o.id === value);
      const label = option?.name || value;
      const match = String(label).match(/-?\d+\.?\d*/);
      const num = match ? parseFloat(match[0]) : 0;
      return {
        value: num,
        success: !!match,
        warning: !match ? 'No numbers in option, defaulting to 0' : undefined,
      };
    }
    
    case 'date':
      return {
        value: new Date(value).getTime(),
        success: true,
        warning: 'Date converted to timestamp',
      };
    
    default:
      const num = Number(value);
      return {
        value: isNaN(num) ? 0 : num,
        success: !isNaN(num),
        warning: isNaN(num) ? 'Invalid number, defaulting to 0' : undefined,
      };
  }
}

/**
 * Transform to select type
 */
function transformToSelect(fromType: string, value: any, options?: any[]): any {
  if (value === null || value === undefined || value === '') {
    return { value: null, success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const str = String(value).trim();
      // Split by comma, semicolon, or pipe
      const parts = str.split(/[,;|]/).map(v => v.trim()).filter(v => v.length > 0);
      
      if (parts.length === 0) {
        return { value: null, success: true, warning: 'Empty value' };
      }
      
      // Create options for unique values
      const uniqueOptions = [...new Set(parts)];
      const newOptions = uniqueOptions.map((label, idx) => ({
        id: `option-${idx}`,
        name: label,
        color: 'gray',
      }));
      
      return {
        value: newOptions[0]?.id || null,
        success: true,
        newOptions,
        warning: parts.length > 1 ? `Found ${parts.length} values, using first` : undefined,
      };
    }
    
    case 'multiSelect':
    case 'multi_select': {
      if (!Array.isArray(value) || value.length === 0) {
        return { value: null, success: true };
      }
      return {
        value: value[0],
        success: true,
        warning: value.length > 1 ? 'Multiple values found, using first' : undefined,
      };
    }
    
    case 'number': {
      const newOptions = [
        { id: 'option-0', name: String(value), color: 'gray' },
      ];
      return { value: 'option-0', success: true, newOptions };
    }
    
    case 'checkbox': {
      const newOptions = [
        { id: 'yes', name: 'Yes', color: 'green' },
        { id: 'no', name: 'No', color: 'gray' },
      ];
      return {
        value: value ? 'yes' : 'no',
        success: true,
        newOptions,
      };
    }
    
    default:
      return { value: null, success: false, warning: 'Unsupported conversion' };
  }
}

/**
 * Transform to multi_select type
 */
function transformToMultiSelect(fromType: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return { value: [], success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const str = String(value).trim();
      const parts = str.split(/[,;|]/).map(v => v.trim()).filter(v => v.length > 0);
      
      if (parts.length === 0) {
        return { value: [], success: true };
      }
      
      const uniqueOptions = [...new Set(parts)];
      const newOptions = uniqueOptions.map((label, idx) => ({
        id: `option-${idx}`,
        name: label,
        color: 'gray',
      }));
      
      return {
        value: newOptions.map(o => o.id),
        success: true,
        newOptions,
      };
    }
    
    case 'select':
      return { value: value ? [value] : [], success: true };
    
    default:
      return { value: [], success: false, warning: 'Unsupported conversion' };
  }
}

/**
 * Transform to checkbox type
 */
function transformToCheckbox(fromType: string, value: any, options?: any[]): any {
  if (value === null || value === undefined || value === '') {
    return { value: false, success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const lower = String(value).toLowerCase().trim();
      const isTrue = ['true', 'yes', '1', 'checked', 'on', 'enabled'].includes(lower);
      const isFalse = ['false', 'no', '0', 'unchecked', 'off', 'disabled'].includes(lower);
      
      return {
        value: isTrue,
        success: isTrue || isFalse,
        warning: !isTrue && !isFalse ? `"${value}" not recognized, defaulting to false` : undefined,
      };
    }
    
    case 'number':
      return {
        value: value !== 0,
        success: true,
        warning: 'Non-zero numbers converted to true',
      };
    
    case 'select': {
      const option = options?.find((o: any) => o.id === value);
      const label = (option?.name || value).toLowerCase();
      const isTrue = ['true', 'yes', '1', 'checked', 'on', 'enabled'].includes(label);
      return { value: isTrue, success: true };
    }
    
    default:
      return { value: Boolean(value), success: true };
  }
}

/**
 * Transform to date type
 */
function transformToDate(fromType: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return { value: new Date().toISOString(), success: true, warning: 'Using today' };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const date = new Date(value);
      const isValid = !isNaN(date.getTime());
      return {
        value: isValid ? date.toISOString() : new Date().toISOString(),
        success: isValid,
        warning: !isValid ? 'Invalid date, using today' : undefined,
      };
    }
    
    case 'number': {
      const date = new Date(value);
      const isValid = !isNaN(date.getTime());
      return {
        value: isValid ? date.toISOString() : new Date().toISOString(),
        success: isValid,
        warning: 'Timestamp converted to date',
      };
    }
    
    default:
      return { value: new Date().toISOString(), success: false, warning: 'Using today' };
  }
}

/**
 * Transform to URL type
 */
function transformToUrl(fromType: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return { value: '', success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const trimmed = String(value).trim();
      const url = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
      return { value: url, success: true };
    }
    
    case 'email':
      return { value: `mailto:${value}`, success: true };
    
    default:
      return { value: String(value), success: true };
  }
}

/**
 * Transform to email type
 */
function transformToEmail(fromType: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return { value: '', success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const trimmed = String(value).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(trimmed);
      return {
        value: trimmed,
        success: isValid,
        warning: !isValid ? 'Invalid email format' : undefined,
      };
    }
    
    case 'url': {
      const email = String(value).replace(/^mailto:/, '');
      return { value: email, success: true };
    }
    
    default:
      return { value: String(value), success: true };
  }
}

/**
 * Transform to phone type
 */
function transformToPhone(fromType: string, value: any): any {
  if (value === null || value === undefined || value === '') {
    return { value: '', success: true };
  }

  switch (fromType) {
    case 'text':
    case 'title':
    case 'rich_text': {
      const digits = String(value).replace(/\D/g, '');
      return {
        value: digits,
        success: digits.length >= 10,
        warning: digits.length < 10 ? 'Phone number may be incomplete' : undefined,
      };
    }
    
    case 'number':
      return { value: String(value), success: true };
    
    default:
      return { value: String(value), success: true };
  }
}
