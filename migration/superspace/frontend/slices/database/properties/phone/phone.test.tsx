/**
 * Phone Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { phonePropertyConfig } from './config';
import { PhoneRenderer } from './PhoneRenderer';
import { PhoneEditor } from './PhoneEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  key: 'testPhone',
  name: 'Phone',
  type: 'phone',
};

describe('phonePropertyConfig', () => {
  it('should have correct type', () => {
    expect(phonePropertyConfig.type).toBe('phone');
  });

  it('should have correct label', () => {
    expect(phonePropertyConfig.label).toBe('Phone');
  });

  it('should be in extended category', () => {
    expect(phonePropertyConfig.category).toBe('extended');
  });

  it('should have correct capabilities', () => {
    expect(phonePropertyConfig.supportsDefault).toBe(true);
    expect(phonePropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(phonePropertyConfig.icon).toBeDefined();
  });
});

describe('phonePropertyConfig.validate', () => {
  it('should accept valid phone numbers', () => {
    expect(phonePropertyConfig.validate?.('123-456-7890', mockProperty)).toBeNull();
    expect(phonePropertyConfig.validate?.('(555) 123-4567', mockProperty)).toBeNull();
    expect(phonePropertyConfig.validate?.('+1 234 567 8900', mockProperty)).toBeNull();
  });

  it('should accept null/undefined/empty', () => {
    expect(phonePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(phonePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
    expect(phonePropertyConfig.validate?.('', mockProperty)).toBeNull();
  });

  it('should reject invalid characters', () => {
    expect(phonePropertyConfig.validate?.('123-ABC-7890', mockProperty)).toBe('Invalid phone number format');
  });

  it('should reject non-string values', () => {
    expect(phonePropertyConfig.validate?.(123 as any, mockProperty)).toBe('Phone must be text');
  });
});

describe('phonePropertyConfig.format', () => {
  it('should trim whitespace', () => {
    expect(phonePropertyConfig.format?.('  123-456-7890  ')).toBe('123-456-7890');
  });

  it('should handle null as empty string', () => {
    expect(phonePropertyConfig.format?.(null)).toBe('');
  });
});

describe('PhoneRenderer', () => {
  it('should render phone as tel: link', () => {
    render(<PhoneRenderer value="123-456-7890" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:123-456-7890');
    expect(link).toHaveTextContent('123-456-7890');
  });

  it('should render phone icon', () => {
    const { container } = render(<PhoneRenderer value="123-456-7890" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<PhoneRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});

describe('PhoneEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    render(<PhoneEditor value="123-456-7890" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('123-456-7890');
  });

  it('should have type="tel" attribute', () => {
    render(<PhoneEditor value="" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<PhoneEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '555-1234');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});

describe('Phone Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = '555-1234';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    let result = render(<PhoneRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    let link = screen.getByRole('link');
    expect(link).toHaveTextContent('555-1234');
    result.unmount();

    result = render(<PhoneEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '555-5678');
    expect(currentValue).toBe('555-5678');
    result.unmount();

    result = render(<PhoneRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    link = screen.getByRole('link');
    expect(link).toHaveTextContent('555-5678');
  });
});
