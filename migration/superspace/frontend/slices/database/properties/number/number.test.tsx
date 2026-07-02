/**
 * Number Property - Unit Tests
 * 
 * Tests for the number property type including:
 * - Configuration validation
 * - Renderer component
 * - Editor component
 * - Integration scenarios
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { numberPropertyConfig } from './config';
import { NumberRenderer } from './NumberRenderer';
import { NumberEditor } from './NumberEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// ==========================================
// Configuration Tests
// ==========================================

describe('numberPropertyConfig', () => {
  it('should have correct type', () => {
    expect(numberPropertyConfig.type).toBe('number');
  });

  it('should have correct label', () => {
    expect(numberPropertyConfig.label).toBe('Number');
  });

  it('should be in core category', () => {
    expect(numberPropertyConfig.category).toBe('core');
  });

  it('should be version 2.0', () => {
    expect(numberPropertyConfig.version).toBe('2.0');
  });

  it('should have correct capabilities', () => {
    expect(numberPropertyConfig.supportsOptions).toBe(false);
    expect(numberPropertyConfig.supportsRequired).toBe(false);
    expect(numberPropertyConfig.supportsDefault).toBe(true);
    expect(numberPropertyConfig.isAuto).toBe(false);
    expect(numberPropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(numberPropertyConfig.icon).toBeDefined();
  });

  it('should have correct tags', () => {
    expect(numberPropertyConfig.tags).toContain('numeric');
    expect(numberPropertyConfig.tags).toContain('number');
  });
});

// ==========================================
// Validation Tests
// ==========================================

describe('numberPropertyConfig.validate', () => {
  const mockProperty: Property = {
    key: 'quantity',
    type: 'number',
    name: 'Quantity',
  };

  it('should accept null value', () => {
    const result = numberPropertyConfig.validate?.(null, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept undefined value', () => {
    const result = numberPropertyConfig.validate?.(undefined, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept integer', () => {
    const result = numberPropertyConfig.validate?.(42, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept decimal', () => {
    const result = numberPropertyConfig.validate?.(3.14159, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept negative numbers', () => {
    const result = numberPropertyConfig.validate?.(-100, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept zero', () => {
    const result = numberPropertyConfig.validate?.(0, mockProperty);
    expect(result).toBeNull();
  });

  it('should reject non-numeric values', () => {
    const result = numberPropertyConfig.validate?.('not a number', mockProperty);
    expect(result).toBe('Must be a valid number');
  });

  it('should reject NaN', () => {
    const result = numberPropertyConfig.validate?.(NaN, mockProperty);
    expect(result).toBe('Must be a valid number');
  });

  it('should reject Infinity', () => {
    const result = numberPropertyConfig.validate?.(Infinity, mockProperty);
    expect(result).toBe('Must be a valid number');
  });
});

// ==========================================
// Formatting Tests
// ==========================================

describe('numberPropertyConfig.format', () => {
  it('should format null as empty string', () => {
    const result = numberPropertyConfig.format?.(null);
    expect(result).toBe('');
  });

  it('should format undefined as empty string', () => {
    const result = numberPropertyConfig.format?.(undefined);
    expect(result).toBe('');
  });

  it('should format integer', () => {
    const result = numberPropertyConfig.format?.(42);
    expect(result).toBe('42');
  });

  it('should format decimal with 2 places', () => {
    const result = numberPropertyConfig.format?.(3.14159);
    expect(result).toMatch(/3\.14/);
  });

  it('should format negative number', () => {
    const result = numberPropertyConfig.format?.(-100);
    expect(result).toBe('-100');
  });

  it('should format zero', () => {
    const result = numberPropertyConfig.format?.(0);
    expect(result).toBe('0');
  });

  it('should format large numbers with commas', () => {
    const result = numberPropertyConfig.format?.(1000000);
    expect(result).toMatch(/1,000,000/);
  });
});

// ==========================================
// Renderer Component Tests
// ==========================================

describe('NumberRenderer', () => {
  const mockProperty: Property = {
    key: 'quantity',
    type: 'number',
    name: 'Quantity',
  };

  it('should render integer value', () => {
    render(<NumberRenderer value={42} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render decimal value', () => {
    render(<NumberRenderer value={3.14} property={mockProperty} readOnly={true} />);
    expect(screen.getByText(/3\.14/)).toBeInTheDocument();
  });

  it('should render negative number', () => {
    render(<NumberRenderer value={-100} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('-100')).toBeInTheDocument();
  });

  it('should render zero', () => {
    render(<NumberRenderer value={0} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<NumberRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render with monospace font', () => {
    const { container } = render(<NumberRenderer value={42} property={mockProperty} readOnly={true} />);
    const element = container.querySelector('.font-mono');
    expect(element).toBeInTheDocument();
  });
});

// ==========================================
// Editor Component Tests
// ==========================================

describe('NumberEditor', () => {
  const mockProperty: Property = {
    key: 'quantity',
    type: 'number',
    name: 'Quantity',
  };

  it('should render input with value', () => {
    const onChange = vi.fn();
    render(<NumberEditor value={42} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...') as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('should render empty input for null', () => {
    const onChange = vi.fn();
    render(<NumberEditor value={null} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberEditor value={null} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...');
    await user.type(input, '123');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('should accept negative numbers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberEditor value={null} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...');
    await user.type(input, '-50');
    
    // onChange should be called with -50 after complete input
    expect(onChange).toHaveBeenCalledWith(-50);
  });

  it('should accept decimal input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberEditor value={null} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...');
    await user.type(input, '3.14');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('should have type="text" attribute for better formatting support', () => {
    const onChange = vi.fn();
    render(<NumberEditor value={42} property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Masukkan angka...') as HTMLInputElement;
    expect(input.type).toBe('text');
  });
});

// ==========================================
// Integration Tests
// ==========================================

describe('Number Property Integration', () => {
  const mockProperty: Property = {
    key: 'quantity',
    type: 'number',
    name: 'Quantity',
    isRequired: true,
  };

  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue: number | null = 100;
    const onChange = (newValue: unknown) => {
      currentValue = Number(newValue);
    };

    // Read mode
    const { unmount } = render(
      <NumberRenderer value={currentValue} property={mockProperty} readOnly={true} />
    );
    expect(screen.getByText('100')).toBeInTheDocument();
    unmount();

    // Edit mode
    render(<NumberEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Masukkan angka...');
    await user.clear(input);
    await user.type(input, '250');
    expect(currentValue).toBe(250);
    unmount();

    // Read mode again
    render(<NumberRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('should validate numeric input', () => {
    const invalidValue = 'not a number';
    const validationResult = numberPropertyConfig.validate?.(invalidValue, mockProperty);
    
    expect(validationResult).toBe('Must be a valid number');
  });

  it('should reject NaN values', () => {
    const validationResult = numberPropertyConfig.validate?.(NaN, mockProperty);
    expect(validationResult).toBe('Must be a valid number');
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe('Number Property Edge Cases', () => {
  const mockProperty: Property = {
    key: 'quantity',
    type: 'number',
    name: 'Quantity',
  };

  it('should handle very large numbers', () => {
    const largeNumber = 999999999999;
    render(<NumberRenderer value={largeNumber} property={mockProperty} readOnly={true} />);
    expect(screen.getByText(/999/)).toBeInTheDocument();
  });

  it('should handle very small decimals', () => {
    const smallDecimal = 0.000001;
    render(<NumberRenderer value={smallDecimal} property={mockProperty} readOnly={true} />);
    expect(screen.getByText(/0\.0/)).toBeInTheDocument();
  });

  it('should handle scientific notation', () => {
    const scientific = 1.23e5;
    const result = numberPropertyConfig.validate?.(scientific, mockProperty);
    expect(result).toBeNull();
  });

  it('should reject infinity', () => {
    const result = numberPropertyConfig.validate?.(Infinity, mockProperty);
    expect(result).toBe('Must be a valid number');
  });

  it('should reject negative infinity', () => {
    const result = numberPropertyConfig.validate?.(-Infinity, mockProperty);
    expect(result).toBe('Must be a valid number');
  });
});
