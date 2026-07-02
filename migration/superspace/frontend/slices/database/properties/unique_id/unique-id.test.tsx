/**
 * Unique ID Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { uniqueIdPropertyConfig } from './config';
import { UniqueIdRenderer } from './UniqueIdRenderer';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'ID',
  type: 'unique_id',
  key: 'id',
};

describe('uniqueIdPropertyConfig', () => {
  it('should have correct type', () => {
    expect(uniqueIdPropertyConfig.type).toBe('unique_id');
  });

  it('should have correct label', () => {
    expect(uniqueIdPropertyConfig.label).toBe('Unique ID');
  });

  it('should be in auto category', () => {
    expect(uniqueIdPropertyConfig.category).toBe('auto');
  });

  it('should be auto-generated, read-only, and unique', () => {
    expect(uniqueIdPropertyConfig.isAuto).toBe(true);
    expect(uniqueIdPropertyConfig.isEditable).toBe(false);
    expect(uniqueIdPropertyConfig.supportsUnique).toBe(true);
  });

  it('should have icon component', () => {
    expect(uniqueIdPropertyConfig.icon).toBeDefined();
  });
});

describe('uniqueIdPropertyConfig.validate', () => {
  it('should accept string IDs', () => {
    expect(uniqueIdPropertyConfig.validate?.('abc-123', mockProperty)).toBeNull();
  });

  it('should accept numeric IDs', () => {
    expect(uniqueIdPropertyConfig.validate?.(12345, mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(uniqueIdPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(uniqueIdPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid types', () => {
    expect(uniqueIdPropertyConfig.validate?.({} as any, mockProperty)).toBe('Unique ID must be text or number');
  });
});

describe('uniqueIdPropertyConfig.format', () => {
  it('should format string IDs', () => {
    expect(uniqueIdPropertyConfig.format?.('abc-123')).toBe('abc-123');
  });

  it('should format numeric IDs', () => {
    expect(uniqueIdPropertyConfig.format?.(12345)).toBe('12345');
  });

  it('should return empty string for null', () => {
    expect(uniqueIdPropertyConfig.format?.(null)).toBe('');
  });
});

describe('UniqueIdRenderer', () => {
  it('should render ID in monospace code', () => {
    const { container } = render(<UniqueIdRenderer value="abc-123" property={mockProperty} readOnly={true} />);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('abc-123');
  });

  it('should render hash icon', () => {
    const { container } = render(<UniqueIdRenderer value="abc-123" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render auto-generated state for null', () => {
    render(<UniqueIdRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Auto-generated')).toBeInTheDocument();
  });

  it('should render numeric IDs', () => {
    render(<UniqueIdRenderer value={12345} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('12345')).toBeInTheDocument();
  });
});
