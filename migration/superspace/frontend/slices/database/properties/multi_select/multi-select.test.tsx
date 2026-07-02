/**
 * Multi-Select Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { multiSelectPropertyConfig } from './config';
import { MultiSelectRenderer } from './MultiSelectRenderer';
import { MultiSelectEditor } from './MultiSelectEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';
import type { SelectOptions } from '@/frontend/shared/foundation/types/property-options';

const mockProperty: Property = {
  name: 'Tags',
  type: 'multi_select',
  key: 'tags',
};

const mockPropertyWithOptions: Property = {
  name: 'Tags',
  type: 'multi_select',
  key: 'tags',
  options: {
    choices: [
      { id: 'tag1', name: 'Frontend', color: '#3b82f6' },
      { id: 'tag2', name: 'Backend', color: '#10b981' },
      { id: 'tag3', name: 'DevOps', color: '#f59e0b' },
    ],
    allowCreate: true,
  } as SelectOptions,
};

describe('multiSelectPropertyConfig', () => {
  it('should have correct type', () => {
    expect(multiSelectPropertyConfig.type).toBe('multi_select');
  });

  it('should have correct label', () => {
    expect(multiSelectPropertyConfig.label).toBe('Multi-Select');
  });

  it('should be in core category', () => {
    expect(multiSelectPropertyConfig.category).toBe('core');
  });

  it('should support options', () => {
    expect(multiSelectPropertyConfig.supportsOptions).toBe(true);
  });

  it('should have icon component', () => {
    expect(multiSelectPropertyConfig.icon).toBeDefined();
  });
});

describe('multiSelectPropertyConfig.validate', () => {
  it('should accept arrays', () => {
    expect(multiSelectPropertyConfig.validate?.(['tag1', 'tag2'], mockProperty)).toBeNull();
  });

  it('should accept comma-separated strings', () => {
    expect(multiSelectPropertyConfig.validate?.('tag1, tag2', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(multiSelectPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(multiSelectPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid types', () => {
    expect(multiSelectPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Multi-select must be an array or comma-separated string');
  });
});

describe('multiSelectPropertyConfig.format', () => {
  it('should format array as comma-separated string', () => {
    expect(multiSelectPropertyConfig.format?.(['tag1', 'tag2', 'tag3'])).toBe('tag1, tag2, tag3');
  });

  it('should format string values', () => {
    expect(multiSelectPropertyConfig.format?.('tag1, tag2')).toBe('tag1, tag2');
  });

  it('should return empty string for null', () => {
    expect(multiSelectPropertyConfig.format?.(null)).toBe('');
  });
});

describe('MultiSelectRenderer', () => {
  it('should render array as badges', () => {
    render(<MultiSelectRenderer value={['tag1', 'tag2']} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('should render comma-separated string as badges', () => {
    render(<MultiSelectRenderer value="tag1, tag2, tag3" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<MultiSelectRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render empty state for empty array', () => {
    render(<MultiSelectRenderer value={[]} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

describe('MultiSelectEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render combobox trigger', () => {
    render(<MultiSelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
  });

  it('should show placeholder when no value selected', () => {
    render(<MultiSelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);
    expect(screen.getByText(/pilih opsi/i)).toBeInTheDocument();
  });

  it('should display selected values as badges', () => {
    render(<MultiSelectEditor value={['Frontend', 'Backend']} onChange={mockOnChange} property={mockPropertyWithOptions} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(<MultiSelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Wait for popover content
    await waitFor(() => {
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('DevOps')).toBeInTheDocument();
    });
  });

  it('should call onChange when selecting an option', async () => {
    const user = userEvent.setup();
    render(<MultiSelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    // Open dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);

    // Wait for and click option
    const option = await screen.findByText('Frontend');
    await user.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(['Frontend']);
  });

  it('should add to existing selection', async () => {
    const user = userEvent.setup();
    render(<MultiSelectEditor value={['Frontend']} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    // Open dropdown
    await user.click(screen.getByRole('combobox'));

    // Select another option
    const option = await screen.findByText('Backend');
    await user.click(option);

    expect(mockOnChange).toHaveBeenCalledWith(['Frontend', 'Backend']);
  });

  it('should show search input in dropdown', async () => {
    const user = userEvent.setup();
    render(<MultiSelectEditor value={null} onChange={mockOnChange} property={mockPropertyWithOptions} />);

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument();
    });
  });
});

describe('Multi-Select Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue: string[] = ['Frontend'];
    const onChange = (newValue: unknown) => {
      currentValue = (newValue as string[]) || [];
    };

    // Read mode
    const { unmount } = render(<MultiSelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    unmount();

    // Edit mode - add another tag
    const { unmount: unmount2 } = render(
      <MultiSelectEditor value={currentValue} property={mockPropertyWithOptions} onChange={onChange} />
    );
    
    await user.click(screen.getByRole('combobox'));
    const backendOption = await screen.findByText('Backend');
    await user.click(backendOption);
    
    expect(currentValue).toContain('Frontend');
    expect(currentValue).toContain('Backend');
    unmount2();

    // Read mode again - should show both values
    render(<MultiSelectRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });
});
