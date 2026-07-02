/**
 * Rich Text Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { richTextPropertyConfig } from './config';
import { RichTextRenderer } from './RichTextRenderer';
import { RichTextEditor } from './RichTextEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Description',
  type: 'rich_text',
  key: 'description',
};

describe('richTextPropertyConfig', () => {
  it('should have correct type', () => {
    expect(richTextPropertyConfig.type).toBe('rich_text');
  });

  it('should be in core category', () => {
    expect(richTextPropertyConfig.category).toBe('core');
  });

  it('should be editable', () => {
    expect(richTextPropertyConfig.isEditable).toBe(true);
  });
});

describe('richTextPropertyConfig.validate', () => {
  it('should accept string values', () => {
    expect(richTextPropertyConfig.validate?.('Hello world', mockProperty)).toBeNull();
    expect(richTextPropertyConfig.validate?.('Multi\nline\ntext', mockProperty)).toBeNull();
  });

  it('should accept null/undefined/empty', () => {
    expect(richTextPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(richTextPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
    expect(richTextPropertyConfig.validate?.('', mockProperty)).toBeNull();
  });

  it('should reject non-string values', () => {
    expect(richTextPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Must be valid text');
  });
});

describe('richTextPropertyConfig.format', () => {
  it('should trim whitespace', () => {
    expect(richTextPropertyConfig.format?.('  Hello world  ')).toBe('Hello world');
  });

  it('should preserve line breaks', () => {
    const multiline = 'Line 1\nLine 2\nLine 3';
    expect(richTextPropertyConfig.format?.(multiline)).toBe(multiline);
  });

  it('should return empty string for null', () => {
    expect(richTextPropertyConfig.format?.(null)).toBe('');
  });
});

describe('RichTextRenderer', () => {
  it('should render text content', () => {
    render(<RichTextRenderer value="Hello world" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<RichTextRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should handle multiline text', () => {
    render(<RichTextRenderer value="Line 1\nLine 2" property={mockProperty} readOnly={true} />);
    expect(screen.getByText(/Line 1/)).toBeInTheDocument();
  });
});

describe('RichTextEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    const { container } = render(<RichTextEditor value="Hello world" onChange={mockOnChange} property={mockProperty} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('Hello world');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const { container } = render(<RichTextEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, 'Hello');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should handle text input', async () => {
    const user = userEvent.setup();
    const { container } = render(<RichTextEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = container.querySelector('input') as HTMLInputElement;
    await user.type(input, 'Test text');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});
