/**
 * Date Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { datePropertyConfig } from './config';
import { DateRenderer } from './DateRenderer';
import { DateEditor } from './DateEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  key: 'testDate',
  name: 'Date',
  type: 'date',
};

describe('datePropertyConfig', () => {
  it('should have correct type', () => {
    expect(datePropertyConfig.type).toBe('date');
  });

  it('should have correct label', () => {
    expect(datePropertyConfig.label).toBe('Date');
  });

  it('should be in core category', () => {
    expect(datePropertyConfig.category).toBe('core');
  });

  it('should have correct capabilities', () => {
    expect(datePropertyConfig.supportsDefault).toBe(true);
    expect(datePropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(datePropertyConfig.icon).toBeDefined();
  });
});

describe('datePropertyConfig.validate', () => {
  it('should accept valid ISO date strings', () => {
    expect(datePropertyConfig.validate?.('2024-01-15', mockProperty)).toBeNull();
    expect(datePropertyConfig.validate?.('2024-12-31T23:59:59Z', mockProperty)).toBeNull();
  });

  it('should accept valid date objects', () => {
    const date = new Date('2024-01-15');
    expect(datePropertyConfig.validate?.(date.toISOString(), mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(datePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(datePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid date strings', () => {
    expect(datePropertyConfig.validate?.('not-a-date', mockProperty)).toBe('Invalid date format');
    expect(datePropertyConfig.validate?.('2024-13-45', mockProperty)).toBe('Invalid date format');
  });
});

describe('datePropertyConfig.format', () => {
  it('should format dates in US format', () => {
    const result = datePropertyConfig.format?.('2024-01-15');
    expect(result).toBe('Jan 15, 2024');
  });

  it('should handle different month names', () => {
    expect(datePropertyConfig.format?.('2024-03-20')).toBe('Mar 20, 2024');
    expect(datePropertyConfig.format?.('2024-12-25')).toBe('Dec 25, 2024');
  });

  it('should return empty string for null', () => {
    expect(datePropertyConfig.format?.(null)).toBe('');
  });

  it('should return empty string for invalid dates', () => {
    expect(datePropertyConfig.format?.('invalid')).toBe('');
  });
});

describe('DateRenderer', () => {
  it('should render formatted date', () => {
    render(<DateRenderer value="2024-01-15" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
  });

  it('should render calendar icon', () => {
    const { container } = render(<DateRenderer value="2024-01-15" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<DateRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should show error for invalid date', () => {
    render(<DateRenderer value="invalid" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });
});

// NOTE: DateEditor tests use Popover/Calendar pattern
describe('DateEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render date picker button', () => {
    render(<DateEditor value={null} onChange={mockOnChange} property={mockProperty} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('should display formatted date when value provided', () => {
    render(<DateEditor value="2024-01-15T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    // date-fns format PPP = "January 15th, 2024"
    expect(screen.getByText(/January 15/)).toBeInTheDocument();
  });

  it('should open calendar popover when clicked', async () => {
    const user = userEvent.setup();
    render(<DateEditor value={null} onChange={mockOnChange} property={mockProperty} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      // Calendar should show month/year navigation
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('should call onChange when date selected', async () => {
    const user = userEvent.setup();
    render(<DateEditor value="2024-01-15T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Click on day 20
    const day20 = screen.getByText('20');
    await user.click(day20);
    
    // Verify onChange was called with an ISO string
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      const calledValue = mockOnChange.mock.calls[0][0];
      expect(typeof calledValue).toBe('string');
      // Verify it parses to January 20th (may be offset due to timezone)
      const date = new Date(calledValue);
      expect(date.getDate()).toBe(20);
    });
  });

  it('should clear date when X clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<DateEditor value="2024-01-15T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    
    // Find the X clear button (last svg in the button)
    const clearButton = container.querySelector('svg.ml-auto');
    expect(clearButton).toBeInTheDocument();
    
    await user.click(clearButton!);
    
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should show calendar icon', () => {
    const { container } = render(<DateEditor value={null} onChange={mockOnChange} property={mockProperty} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should update display when value prop changes', () => {
    const { rerender } = render(<DateEditor value="2024-01-15T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    expect(screen.getByText(/January 15/)).toBeInTheDocument();

    rerender(<DateEditor value="2024-12-25T00:00:00Z" onChange={mockOnChange} property={mockProperty} />);
    expect(screen.getByText(/December 25/)).toBeInTheDocument();
  });
});

describe('Date Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = '2024-01-15T00:00:00Z';
    const handleChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    // 1. Render in read mode
    let result = render(<DateRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    result.unmount();

    // 2. Render in edit mode and change date
    result = render(<DateEditor value={currentValue} property={mockProperty} onChange={handleChange} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
    
    // Select day 20
    const day20 = screen.getByText('20');
    await user.click(day20);
    
    // Wait for calendar to close and verify display shows Jan 20
    await waitFor(() => {
      expect(screen.getByText(/January 20/)).toBeInTheDocument();
    });
    result.unmount();

    // 3. Render back in read mode with new value - check new date was applied
    result = render(<DateRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
  });
});

describe('Date Property Edge Cases', () => {
  it('should handle leap year dates', () => {
    render(<DateRenderer value="2024-02-29" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Feb 29, 2024')).toBeInTheDocument();
  });

  it('should handle year boundaries', () => {
    render(<DateRenderer value="2024-01-01" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
    
    render(<DateRenderer value="2024-12-31" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('should handle dates with time components', () => {
    render(<DateRenderer value="2024-06-15T14:30:00Z" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Jun 15, 2024')).toBeInTheDocument();
  });
});
