/**
 * Select Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { selectPropertyConfig } from './config';
import { SelectRenderer } from './SelectRenderer';
import { SelectEditor } from './SelectEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { SelectOptions } from '@/frontend/shared/foundation/types/property-options';

const mockProperty: Property = {
  name: 'Status',
  type: 'select',
  key: 'status',
};

const mockPropertyWithOptions: Property = {
  name: 'Status',
  type: 'select',
  key: 'status',
  options: {
    choices: [
      { id: 'opt1', name: 'In Progress', color: '#3b82f6' },
      { id: 'opt2', name: 'Done', color: '#10b981' },
      { id: 'opt3', name: 'Blocked', color: '#ef4444' },
    ],
    allowCreate: true,
  } as SelectOptions,
};

describe('selectPropertyConfig', () => {
  it('should have correct type', () => {
    expect(selectPropertyConfig.type).toBe('select');
  });

  it('should have correct label', () => {
    expect(selectPropertyConfig.label).toBe('Select');
  });

  it('should be in core category', () => {
    expect(selectPropertyConfig.category).toBe('core');
  });

  it('should support options', () => {
    expect(selectPropertyConfig.supportsOptions).toBe(true);
  });

  it('should have icon component', () => {
    expect(selectPropertyConfig.icon).toBeDefined();
  });
});

describe('selectPropertyConfig.validate', () => {
  it('should accept string values', () => {
    expect(selectPropertyConfig.validate?.('In Progress', mockProperty)).toBeNull();
    expect(selectPropertyConfig.validate?.('Done', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(selectPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(selectPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject non-string values', () => {
    expect(selectPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Select value must be text');
  });
});

describe('selectPropertyConfig.format', () => {
  it('should format string values', () => {
    expect(selectPropertyConfig.format?.('In Progress')).toBe('In Progress');
  });

  it('should return empty string for null', () => {
    expect(selectPropertyConfig.format?.(null)).toBe('');
  });
});

describe('SelectRenderer', () => {
  it('should render value as badge', () => {
    render(<SelectRenderer value="In Progress" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<SelectRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

describe('SelectEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render combobox trigger', () => {
    render(<SelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('should show placeholder when no value selected', () => {
    render(<SelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);
    expect(screen.getByText(/pilih opsi/i)).toBeInTheDocument();
  });

  it('should display selected value as badge', () => {
    render(<SelectEditor value="In Progress" onChange={mockOnChange} property={mockPropertyWithOptions} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(<SelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Wait for popover content
    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Blocked')).toBeInTheDocument();
    });
  });

  it('should call onChange when selecting an option', async () => {
    const user = userEvent.setup();
    render(<SelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    // Open dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Wait for and click option
    const option = await screen.findByText('Done');
    await user.click(option);

    expect(mockOnChange).toHaveBeenCalledWith('Done');
  });

  it('should show search input in dropdown', async () => {
    const user = userEvent.setup();
    render(<SelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    await user.click(screen.getByRole('combobox'));

    // Command input should be visible
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });
  });
});

describe('Select Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue: string | null = 'In Progress';
    const onChange = (newValue: unknown) => {
      currentValue = newValue as string | null;
    };

    // Read mode
    const { unmount } = render(<SelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    unmount();

    // Edit mode - select different option
    const { unmount: unmount2 } = render(
      <SelectEditor value={currentValue} property={mockPropertyWithOptions} onChange={onChange} />
    );
    
    await user.click(screen.getByRole('combobox'));
    const doneOption = await screen.findByText('Done');
    await user.click(doneOption);
    
    expect(currentValue).toBe('Done');
    unmount2();

    // Read mode again - should show new value
    render(<SelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
