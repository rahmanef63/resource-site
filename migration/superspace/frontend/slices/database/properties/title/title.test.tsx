/**
 * Title Property - Unit Tests
 * 
 * Tests for the title property type including:
 * - Configuration validation
 * - Renderer component
 * - Editor component
 * - Integration scenarios
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import titlePropertyConfig from './config';
import { TitleRenderer } from './TitleRenderer';
import { TitleEditor } from './TitleEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// ==========================================
// Configuration Tests
// ==========================================

describe('titlePropertyConfig', () => {
  it('should have correct type', () => {
    expect(titlePropertyConfig.type).toBe('title');
  });

  it('should have correct label', () => {
    expect(titlePropertyConfig.label).toBe('Title');
  });

  it('should be in core category', () => {
    expect(titlePropertyConfig.category).toBe('core');
  });

  it('should be version 2.0', () => {
    expect(titlePropertyConfig.version).toBe('2.0');
  });

  it('should have correct capabilities', () => {
    expect(titlePropertyConfig.supportsOptions).toBe(false);
    expect(titlePropertyConfig.supportsRequired).toBe(true);
    expect(titlePropertyConfig.supportsUnique).toBe(false);
    expect(titlePropertyConfig.supportsDefault).toBe(true);
    expect(titlePropertyConfig.isAuto).toBe(false);
    expect(titlePropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(titlePropertyConfig.icon).toBeDefined();
  });

  it('should have Renderer component', () => {
    expect(titlePropertyConfig.Renderer).toBeDefined();
  });

  it('should have Editor component', () => {
    expect(titlePropertyConfig.Editor).toBeDefined();
  });

  it('should have correct tags', () => {
    expect(titlePropertyConfig.tags).toContain('text');
    expect(titlePropertyConfig.tags).toContain('primary');
  });
});

// ==========================================
// Validation Tests
// ==========================================

describe('titlePropertyConfig.validate', () => {
  const mockProperty: Property = {
    key: 'title',
    type: 'title',
    name: 'Title',
  };

  it('should accept null value', () => {
    const result = titlePropertyConfig.validate?.(null, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept undefined value', () => {
    const result = titlePropertyConfig.validate?.(undefined, mockProperty);
    expect(result).toBeNull();
  });

  it('should accept empty string', () => {
    const result = titlePropertyConfig.validate?.('', mockProperty);
    expect(result).toBeNull();
  });

  it('should accept valid string', () => {
    const result = titlePropertyConfig.validate?.('My Title', mockProperty);
    expect(result).toBeNull();
  });

  it('should reject non-string values', () => {
    const result = titlePropertyConfig.validate?.(123, mockProperty);
    expect(result).toBe('Title must be text');
  });

  it('should reject strings over 200 characters', () => {
    const longString = 'a'.repeat(201);
    const result = titlePropertyConfig.validate?.(longString, mockProperty);
    expect(result).toBe('Title must be 200 characters or less');
  });

  it('should accept strings exactly 200 characters', () => {
    const exactString = 'a'.repeat(200);
    const result = titlePropertyConfig.validate?.(exactString, mockProperty);
    expect(result).toBeNull();
  });
});

// ==========================================
// Formatting Tests
// ==========================================

describe('titlePropertyConfig.format', () => {
  it('should format null as empty string', () => {
    const result = titlePropertyConfig.format?.(null);
    expect(result).toBe('');
  });

  it('should format undefined as empty string', () => {
    const result = titlePropertyConfig.format?.(undefined);
    expect(result).toBe('');
  });

  it('should trim whitespace', () => {
    const result = titlePropertyConfig.format?.('  My Title  ');
    expect(result).toBe('My Title');
  });

  it('should convert numbers to string', () => {
    const result = titlePropertyConfig.format?.(123);
    expect(result).toBe('123');
  });

  it('should handle string values', () => {
    const result = titlePropertyConfig.format?.('My Title');
    expect(result).toBe('My Title');
  });
});

// ==========================================
// Renderer Component Tests
// ==========================================

describe('TitleRenderer', () => {
  const mockProperty: Property = {
    key: 'title',
    type: 'title',
    name: 'Title',
  };

  it('should render text value', () => {
    render(<TitleRenderer value="My Project" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
  });

  it('should render "Untitled" for empty value', () => {
    render(<TitleRenderer value="" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('should have correct styling for empty value', () => {
    render(<TitleRenderer value="" property={mockProperty} readOnly={true} />);
    const element = screen.getByText('Untitled');
    expect(element).toHaveClass('text-muted-foreground');
    expect(element).toHaveClass('italic');
  });

  it('should render with correct text styling for non-empty value', () => {
    render(<TitleRenderer value="My Project" property={mockProperty} readOnly={true} />);
    const element = screen.getByText('My Project');
    expect(element).toHaveClass('font-medium');
    expect(element).toHaveClass('text-foreground');
  });
});

// ==========================================
// Editor Component Tests
// ==========================================

describe('TitleEditor', () => {
  const mockProperty: Property = {
    key: 'title',
    type: 'title',
    name: 'Title',
  };

  it('should render input with value', () => {
    const onChange = vi.fn();
    render(<TitleEditor value="My Project" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
    expect(input.value).toBe('My Project');
  });

  it('should render empty input for empty value', () => {
    const onChange = vi.fn();
    render(<TitleEditor value="" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TitleEditor value="" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...');
    await user.type(input, 'New Title');
    
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith('New Title');
  });

  it('should update value when prop changes', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TitleEditor value="Initial" property={mockProperty} onChange={onChange} />
    );
    
    rerender(<TitleEditor value="Updated" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
    expect(input.value).toBe('Updated');
  });

  it('should have maxLength of 200', () => {
    const onChange = vi.fn();
    render(<TitleEditor value="" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...') as HTMLInputElement;
    expect(input.maxLength).toBe(200);
  });

  it('should handle clearing input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TitleEditor value="Old Title" property={mockProperty} onChange={onChange} />);
    
    const input = screen.getByPlaceholderText('Enter title...');
    await user.clear(input);
    
    expect(onChange).toHaveBeenCalledWith('');
  });
});

// ==========================================
// Integration Tests
// ==========================================

describe('Title Property Integration', () => {
  const mockProperty: Property = {
    key: 'title',
    type: 'title',
    name: 'Project Title',
  };

  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = 'Initial Title';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    // Read mode
    const { rerender, unmount } = render(
      <TitleRenderer value={currentValue} property={mockProperty} readOnly={true} />
    );
    expect(screen.getByText('Initial Title')).toBeInTheDocument();
    unmount();

    // Edit mode
    render(<TitleEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Enter title...');
    await user.clear(input);
    await user.type(input, 'Updated Title');
    expect(currentValue).toBe('Updated Title');
    unmount();

    // Read mode again
    render(<TitleRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Updated Title')).toBeInTheDocument();
  });

  it('should validate before accepting changes', () => {
    const invalidValue = 123;
    const validationResult = titlePropertyConfig.validate?.(invalidValue, mockProperty);
    
    expect(validationResult).toBe('Title must be text');
  });

  it('should enforce 200 character limit', () => {
    const longTitle = 'a'.repeat(201);
    const validationResult = titlePropertyConfig.validate?.(longTitle, mockProperty);
    
    expect(validationResult).toBe('Title must be 200 characters or less');
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe('Title Property Edge Cases', () => {
  const mockProperty: Property = {
    key: 'title',
    type: 'title',
    name: 'Title',
  };

  it('should handle special characters', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\';
    render(<TitleRenderer value={specialChars} property={mockProperty} readOnly={true} />);
    expect(screen.getByText(specialChars)).toBeInTheDocument();
  });

  it('should handle unicode characters', () => {
    const unicode = '你好 🎉 مرحبا';
    render(<TitleRenderer value={unicode} property={mockProperty} readOnly={true} />);
    expect(screen.getByText(unicode)).toBeInTheDocument();
  });

  it('should handle very long single word', () => {
    const longWord = 'a'.repeat(200); // Exactly 200 chars
    const result = titlePropertyConfig.validate?.(longWord, mockProperty);
    expect(result).toBeNull(); // Should be valid at exactly 200 chars
  });

  it('should handle whitespace-only string', () => {
    const whitespace = '   ';
    const formatted = titlePropertyConfig.format?.(whitespace);
    expect(formatted).toBe(''); // Should trim to empty
  });
});
