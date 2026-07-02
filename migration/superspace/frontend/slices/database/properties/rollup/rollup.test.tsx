/**
 * Rollup Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { rollupPropertyConfig } from './config';
import { RollupRenderer } from './RollupRenderer';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Sum Total',
  type: 'rollup',
  key: 'sumTotal',
};

describe('rollupPropertyConfig', () => {
  it('should have correct type', () => {
    expect(rollupPropertyConfig.type).toBe('rollup');
  });

  it('should be in extended category', () => {
    expect(rollupPropertyConfig.category).toBe('extended');
  });

  it('should be auto-generated and read-only', () => {
    expect(rollupPropertyConfig.isAuto).toBe(true);
    expect(rollupPropertyConfig.isEditable).toBe(false);
  });

  it('should support options for aggregation config', () => {
    expect(rollupPropertyConfig.supportsOptions).toBe(true);
  });
});

describe('rollupPropertyConfig.validate', () => {
  it('should accept any value type', () => {
    expect(rollupPropertyConfig.validate?.(100, mockProperty)).toBeNull();
    expect(rollupPropertyConfig.validate?.('text', mockProperty)).toBeNull();
    expect(rollupPropertyConfig.validate?.(null, mockProperty)).toBeNull();
  });
});

describe('rollupPropertyConfig.format', () => {
  it('should format numbers with commas', () => {
    expect(rollupPropertyConfig.format?.(5000)).toBe('5,000');
  });

  it('should format decimals', () => {
    expect(rollupPropertyConfig.format?.(1234.56)).toBe('1,234.56');
  });

  it('should format strings as-is', () => {
    expect(rollupPropertyConfig.format?.('Total')).toBe('Total');
  });

  it('should return empty string for null', () => {
    expect(rollupPropertyConfig.format?.(null)).toBe('');
  });
});

describe('RollupRenderer', () => {
  it('should render numeric aggregation', () => {
    render(<RollupRenderer value={150} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('150 items')).toBeInTheDocument();
  });

  it('should render string aggregation', () => {
    render(<RollupRenderer value="Sum: 150" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Sum: 150')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<RollupRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render calculator icon', () => {
    const { container } = render(<RollupRenderer value={100} property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle zero value', () => {
    render(<RollupRenderer value={0} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('0 items')).toBeInTheDocument();
  });

  it('should handle negative values', () => {
    render(<RollupRenderer value={-50} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('-50 items')).toBeInTheDocument();
  });
});
