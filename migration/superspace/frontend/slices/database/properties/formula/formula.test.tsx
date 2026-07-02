/**
 * Formula Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formulaPropertyConfig } from './config';
import { FormulaRenderer } from './FormulaRenderer';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Total',
  type: 'formula',
  key: 'total',
};

describe('formulaPropertyConfig', () => {
  it('should have correct type', () => {
    expect(formulaPropertyConfig.type).toBe('formula');
  });

  it('should be in extended category', () => {
    expect(formulaPropertyConfig.category).toBe('extended');
  });

  it('should be auto-generated and read-only', () => {
    expect(formulaPropertyConfig.isAuto).toBe(true);
    expect(formulaPropertyConfig.isEditable).toBe(false);
  });

  it('should support options for formula expression', () => {
    expect(formulaPropertyConfig.supportsOptions).toBe(true);
  });
});

describe('formulaPropertyConfig.validate', () => {
  it('should accept any value type', () => {
    expect(formulaPropertyConfig.validate?.('text', mockProperty)).toBeNull();
    expect(formulaPropertyConfig.validate?.(123, mockProperty)).toBeNull();
    expect(formulaPropertyConfig.validate?.(true, mockProperty)).toBeNull();
    expect(formulaPropertyConfig.validate?.(null, mockProperty)).toBeNull();
  });
});

describe('formulaPropertyConfig.format', () => {
  it('should format numbers with commas', () => {
    expect(formulaPropertyConfig.format?.(1234.56)).toBe('1,234.56');
  });

  it('should format booleans as Yes/No', () => {
    expect(formulaPropertyConfig.format?.(true)).toBe('Yes');
    expect(formulaPropertyConfig.format?.(false)).toBe('No');
  });

  it('should format strings as-is', () => {
    expect(formulaPropertyConfig.format?.('Hello')).toBe('Hello');
  });

  it('should return empty string for null', () => {
    expect(formulaPropertyConfig.format?.(null)).toBe('');
  });
});

describe('FormulaRenderer', () => {
  it('should render numeric result', () => {
    render(<FormulaRenderer value={42} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render string result', () => {
    render(<FormulaRenderer value="Calculated" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Calculated')).toBeInTheDocument();
  });

  it('should render boolean result', () => {
    render(<FormulaRenderer value={true} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('✓ True')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<FormulaRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render binary icon', () => {
    const { container } = render(<FormulaRenderer value={42} property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle large numbers', () => {
    render(<FormulaRenderer value={1000000} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });
});
