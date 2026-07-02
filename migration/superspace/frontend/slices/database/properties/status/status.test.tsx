/**
 * Status Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { statusPropertyConfig } from './config';
import { StatusRenderer } from './StatusRenderer';
import { StatusEditor } from './StatusEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Status',
  type: 'status',
  key: 'status',
};

describe('statusPropertyConfig', () => {
  it('should have correct type', () => {
    expect(statusPropertyConfig.type).toBe('status');
  });

  it('should have correct label', () => {
    expect(statusPropertyConfig.label).toBe('Status');
  });

  it('should be in extended category', () => {
    expect(statusPropertyConfig.category).toBe('extended');
  });

  it('should support options', () => {
    expect(statusPropertyConfig.supportsOptions).toBe(true);
  });

  it('should have icon component', () => {
    expect(statusPropertyConfig.icon).toBeDefined();
  });
});

describe('statusPropertyConfig.validate', () => {
  it('should accept string values', () => {
    expect(statusPropertyConfig.validate?.('In Progress', mockProperty)).toBeNull();
    expect(statusPropertyConfig.validate?.('Completed', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(statusPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(statusPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject non-string values', () => {
    expect(statusPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Status must be text');
  });
});

describe('statusPropertyConfig.format', () => {
  it('should format string values', () => {
    expect(statusPropertyConfig.format?.('In Progress')).toBe('In Progress');
  });

  it('should return empty string for null', () => {
    expect(statusPropertyConfig.format?.(null)).toBe('');
  });
});

describe('StatusRenderer', () => {
  it('should render status as colored badge', () => {
    render(<StatusRenderer value="In Progress" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<StatusRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('No status')).toBeInTheDocument();
  });

  it('should apply correct color for completed status', () => {
    const { container } = render(<StatusRenderer value="Completed" property={mockProperty} readOnly={true} />);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color for in progress status', () => {
    const { container } = render(<StatusRenderer value="In Progress" property={mockProperty} readOnly={true} />);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });
});

describe('StatusEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    render(<StatusEditor value="In Progress" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('In Progress');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<StatusEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('combobox');
    await user.type(input, 'Done');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});

describe('Status Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = 'In Progress';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue || '');
    };

    let result = render(<StatusRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    result.unmount();

    result = render(<StatusEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.clear(input);
    await user.type(input, 'Completed');
    expect(currentValue).toBe('Completed');
    result.unmount();

    result = render(<StatusRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
