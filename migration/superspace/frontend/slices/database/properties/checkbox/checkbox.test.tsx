/**
 * Checkbox Property - Unit Tests
 * 
 * Tests for the checkbox property type including:
 * - Configuration validation
 * - Renderer component
 * - Editor component
 * - Integration scenarios
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import checkboxPropertyConfig from './config';
import { CheckboxRenderer } from './CheckboxRenderer';
import { CheckboxEditor } from './CheckboxEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// ==========================================
// Configuration Tests
// ==========================================

describe('checkboxPropertyConfig', () => {
  it('should have correct type', () => {
    expect(checkboxPropertyConfig.type).toBe('checkbox');
  });

  it('should have correct label', () => {
    expect(checkboxPropertyConfig.label).toBe('Checkbox');
  });

  it('should be in core category', () => {
    expect(checkboxPropertyConfig.category).toBe('core');
  });

  it('should be version 2.0', () => {
    expect(checkboxPropertyConfig.version).toBe('2.0');
  });

  it('should have correct capabilities', () => {
    expect(checkboxPropertyConfig.supportsOptions).toBe(false);
    expect(checkboxPropertyConfig.supportsRequired).toBe(false); // Checkboxes typically not required
    expect(checkboxPropertyConfig.supportsDefault).toBe(true);
    expect(checkboxPropertyConfig.isAuto).toBe(false);
    expect(checkboxPropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(checkboxPropertyConfig.icon).toBeDefined();
  });

  it('should have correct tags', () => {
    expect(checkboxPropertyConfig.tags).toContain('boolean');
    expect(checkboxPropertyConfig.tags).toContain('toggle');
  });
});

// ==========================================
// Validation Tests
// ==========================================

describe('checkboxPropertyConfig.validate', () => {
  const mockProperty: Property = {
    key: 'completed',
    type: 'checkbox',
    name: 'Completed',
  };

  it('should accept true', () => {
    const result = checkboxPropertyConfig.validate?.(true, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept false', () => {
    const result = checkboxPropertyConfig.validate?.(false, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept null', () => {
    const result = checkboxPropertyConfig.validate?.(null, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept undefined', () => {
    const result = checkboxPropertyConfig.validate?.(undefined, mockProperty);
    expect(result).toBeNull();
  });

  it('should reject non-boolean values', () => {
    const result = checkboxPropertyConfig.validate?.('yes', mockProperty);
    expect(result).toBe('Checkbox value must be true or false');
  });

  it('should reject numbers', () => {
    const result = checkboxPropertyConfig.validate?.(1, mockProperty);
    expect(result).toBe('Checkbox value must be true or false');
  });
});

// ==========================================
// Formatting Tests
// ==========================================

describe('checkboxPropertyConfig.format', () => {
  it('should format true as "Yes"', () => {
    const result = checkboxPropertyConfig.format?.(true);
    expect(result).toBe('Yes');
  });

  it('should format false as "No"', () => {
    const result = checkboxPropertyConfig.format?.(false);
    expect(result).toBe('No');
  });

  it('should format null as "No"', () => {
    const result = checkboxPropertyConfig.format?.(null);
    expect(result).toBe('No');
  });

  it('should format undefined as "No"', () => {
    const result = checkboxPropertyConfig.format?.(undefined);
    expect(result).toBe('No');
  });
});

// ==========================================
// Renderer Component Tests
// ==========================================

describe('CheckboxRenderer', () => {
  const mockProperty: Property = {
    key: 'completed',
    type: 'checkbox',
    name: 'Completed',
  };

  it('should render checked checkbox for true', () => {
    render(<CheckboxRenderer value={true} property={mockProperty} readOnly={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('should render unchecked checkbox for false', () => {
    render(<CheckboxRenderer value={false} property={mockProperty} readOnly={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('should render unchecked checkbox for null', () => {
    render(<CheckboxRenderer value={null} property={mockProperty} readOnly={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('should be disabled in read-only mode', () => {
    render(<CheckboxRenderer value={true} property={mockProperty} readOnly={true} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });
});

// ==========================================
// Editor Component Tests
// ==========================================

describe('CheckboxEditor', () => {
  const mockProperty: Property = {
    key: 'completed',
    type: 'checkbox',
    name: 'Completed',
  };

  it('should render checked checkbox for true', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={true} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('should render unchecked checkbox for false', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('should call onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should toggle from true to false', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxEditor value={true} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should not be disabled in edit mode', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(false);
  });

  it('should handle null as unchecked', () => {
    const onChange = vi.fn();
    render(<CheckboxEditor value={null} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });
});

// ==========================================
// Integration Tests
// ==========================================

describe('Checkbox Property Integration', () => {
  const mockProperty: Property = {
    key: 'completed',
    type: 'checkbox',
    name: 'Completed',
  };

  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = false;
    const onChange = (newValue: unknown) => {
      currentValue = Boolean(newValue);
    };

    // Read mode (unchecked)
    let result = render(
      <CheckboxRenderer value={currentValue} property={mockProperty} readOnly={true} />
    );
    let checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    result.unmount();

    // Edit mode - toggle to true
    result = render(<CheckboxEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(currentValue).toBe(true);
    result.unmount();

    // Read mode (checked)
    result = render(<CheckboxRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    checkbox = screen.getByRole('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('should validate boolean values', () => {
    const validationResult = checkboxPropertyConfig.validate?.(true, mockProperty);
    expect(validationResult).toBeNull();
  });

  it('should reject non-boolean values', () => {
    const validationResult = checkboxPropertyConfig.validate?.('yes', mockProperty);
    expect(validationResult).toBe('Checkbox value must be true or false');
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe('Checkbox Property Edge Cases', () => {
  const mockProperty: Property = {
    key: 'completed',
    type: 'checkbox',
    name: 'Completed',
  };

  it('should handle rapid toggling', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    await user.click(checkbox);
    await user.click(checkbox);
    
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('should handle keyboard interaction (Space)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxEditor value={false} property={mockProperty} onChange={onChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await user.keyboard(' ');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('should coerce truthy values to true', () => {
    const result = checkboxPropertyConfig.format?.(1);
    expect(result).toBe('Yes');
  });

  it('should coerce falsy values to false', () => {
    const result = checkboxPropertyConfig.format?.(0);
    expect(result).toBe('No');
  });
});
