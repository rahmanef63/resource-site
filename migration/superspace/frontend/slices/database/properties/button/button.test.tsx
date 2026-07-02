/**
 * Button Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buttonPropertyConfig } from './config';
import { ButtonRenderer } from './ButtonRenderer';
import { ButtonEditor } from './ButtonEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Action',
  type: 'button',
  key: 'action',
};

describe('buttonPropertyConfig', () => {
  it('should have correct type', () => {
    expect(buttonPropertyConfig.type).toBe('button');
  });

  it('should be in extended category', () => {
    expect(buttonPropertyConfig.category).toBe('extended');
  });

  it('should support options', () => {
    expect(buttonPropertyConfig.supportsOptions).toBe(true);
  });

  it('should be editable', () => {
    expect(buttonPropertyConfig.isEditable).toBe(true);
  });
});

describe('buttonPropertyConfig.validate', () => {
  it('should accept string values', () => {
    expect(buttonPropertyConfig.validate?.('https://example.com', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(buttonPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(buttonPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject non-string values', () => {
    expect(buttonPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Button value must be text');
  });
});

describe('buttonPropertyConfig.format', () => {
  it('should format string values', () => {
    expect(buttonPropertyConfig.format?.('https://example.com')).toBe('https://example.com');
  });

  it('should return empty string for null', () => {
    expect(buttonPropertyConfig.format?.(null)).toBe('');
  });
});

describe('ButtonRenderer', () => {
  beforeEach(() => {
    // Mock window.open
    global.window.open = vi.fn();
  });

  it('should render button with default label', () => {
    render(<ButtonRenderer value="https://example.com" property={mockProperty} readOnly={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Click');
  });

  it('should render button with custom label', () => {
    const propertyWithLabel: Property = {
      ...mockProperty,
      options: { label: 'Open Link' },
    };
    render(<ButtonRenderer value="https://example.com" property={propertyWithLabel} readOnly={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Open Link');
  });

  it('should render no action state for null', () => {
    render(<ButtonRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('No action')).toBeInTheDocument();
  });

  it('should open URL when clicked', async () => {
    const user = userEvent.setup();
    render(<ButtonRenderer value="https://example.com" property={mockProperty} readOnly={true} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('should render external link icon', () => {
    const { container } = render(<ButtonRenderer value="https://example.com" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('ButtonEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with URL value', () => {
    render(<ButtonEditor value="https://example.com" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('https://example.com');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<ButtonEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'https://example.com');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});
