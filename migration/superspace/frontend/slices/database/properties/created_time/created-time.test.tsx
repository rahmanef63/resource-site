/**
 * Created Time Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createdTimePropertyConfig } from './config';
import { CreatedTimeRenderer } from './CreatedTimeRenderer';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Created',
  type: 'created_time',
  key: 'created',
};

describe('createdTimePropertyConfig', () => {
  it('should have correct type', () => {
    expect(createdTimePropertyConfig.type).toBe('created_time');
  });

  it('should have correct label', () => {
    expect(createdTimePropertyConfig.label).toBe('Created Time');
  });

  it('should be in auto category', () => {
    expect(createdTimePropertyConfig.category).toBe('auto');
  });

  it('should be auto-generated and read-only', () => {
    expect(createdTimePropertyConfig.isAuto).toBe(true);
    expect(createdTimePropertyConfig.isEditable).toBe(false);
  });

  it('should have icon component', () => {
    expect(createdTimePropertyConfig.icon).toBeDefined();
  });
});

describe('createdTimePropertyConfig.validate', () => {
  it('should accept valid timestamps', () => {
    expect(createdTimePropertyConfig.validate?.('2024-01-15T10:30:00Z', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(createdTimePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(createdTimePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid timestamps', () => {
    expect(createdTimePropertyConfig.validate?.('invalid', mockProperty)).toBe('Invalid timestamp format');
  });
});

describe('createdTimePropertyConfig.format', () => {
  it('should format with date and time', () => {
    const result = createdTimePropertyConfig.format?.('2024-01-15T10:30:00Z');
    expect(result).toContain('Jan 15, 2024');
    expect(result).toContain(':');
  });

  it('should return empty string for null', () => {
    expect(createdTimePropertyConfig.format?.(null)).toBe('');
  });
});

describe('CreatedTimeRenderer', () => {
  it('should render relative time for recent dates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    render(<CreatedTimeRenderer value={fiveMinutesAgo} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText(/m ago/)).toBeInTheDocument();
  });

  it('should render clock icon', () => {
    const { container } = render(<CreatedTimeRenderer value={new Date().toISOString()} property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render not set for null', () => {
    render(<CreatedTimeRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  it('should show error for invalid date', () => {
    render(<CreatedTimeRenderer value="invalid" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });
});
