/**
 * Email Property - Unit Tests
 * 
 * Tests for the email property type including:
 * - Configuration validation
 * - Email format validation
 * - Renderer component (with mailto links)
 * - Editor component
 * - Integration scenarios
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emailPropertyConfig } from './config';
import { EmailRenderer } from './EmailRenderer';
import { EmailEditor } from './EmailEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// ==========================================
// Mock Property Object
// ==========================================

const mockProperty: Property = {
  key: 'test-email-prop',
  name: 'Email',
  type: 'email',
};

// ==========================================
// Configuration Tests
// ==========================================

describe('emailPropertyConfig', () => {
  it('should have correct type', () => {
    expect(emailPropertyConfig.type).toBe('email');
  });

  it('should have correct label', () => {
    expect(emailPropertyConfig.label).toBe('Email');
  });

  it('should be in core category', () => {
    expect(emailPropertyConfig.category).toBe('core');
  });

  it('should be version 2.0', () => {
    expect(emailPropertyConfig.version).toBe('2.0');
  });

  it('should have correct capabilities', () => {
    expect(emailPropertyConfig.supportsOptions).toBe(false);
    expect(emailPropertyConfig.supportsRequired).toBe(false);
    expect(emailPropertyConfig.supportsUnique).toBe(true); // Email should support unique
    expect(emailPropertyConfig.supportsDefault).toBe(true);
    expect(emailPropertyConfig.isAuto).toBe(false);
    expect(emailPropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(emailPropertyConfig.icon).toBeDefined();
  });

  it('should have correct tags', () => {
    expect(emailPropertyConfig.tags).toContain('contact');
    expect(emailPropertyConfig.tags).toContain('email');
  });
});

// ==========================================
// Validation Tests
// ==========================================

describe('emailPropertyConfig.validate', () => {
  it('should accept valid email addresses', () => {
    expect(emailPropertyConfig.validate?.('user@example.com', mockProperty)).toBeNull();
    expect(emailPropertyConfig.validate?.('test.user@domain.co.uk', mockProperty)).toBeNull();
    expect(emailPropertyConfig.validate?.('name+tag@company.com', mockProperty)).toBeNull();
  });

  it('should accept null value', () => {
    expect(emailPropertyConfig.validate?.(null, mockProperty)).toBeNull();
  });

  it('should accept undefined value', () => {
    expect(emailPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should accept empty string', () => {
    expect(emailPropertyConfig.validate?.('', mockProperty)).toBeNull();
  });

  it('should reject invalid email format - missing @', () => {
    expect(emailPropertyConfig.validate?.('invalidemail.com', mockProperty)).toBe('Invalid email format');
  });

  it('should reject invalid email format - missing domain', () => {
    expect(emailPropertyConfig.validate?.('user@', mockProperty)).toBe('Invalid email format');
  });

  it('should reject invalid email format - missing TLD', () => {
    expect(emailPropertyConfig.validate?.('user@domain', mockProperty)).toBe('Invalid email format');
  });

  it('should reject invalid email format - spaces', () => {
    expect(emailPropertyConfig.validate?.('user name@domain.com', mockProperty)).toBe('Invalid email format');
  });

  it('should reject non-string values', () => {
    expect(emailPropertyConfig.validate?.(123 as any, mockProperty)).toBe('Email must be text');
    expect(emailPropertyConfig.validate?.({ email: 'test@test.com' } as any, mockProperty)).toBe('Email must be text');
  });
});

// ==========================================
// Formatting Tests
// ==========================================

describe('emailPropertyConfig.format', () => {
  it('should format valid email to lowercase', () => {
    expect(emailPropertyConfig.format?.('USER@EXAMPLE.COM')).toBe('user@example.com');
    expect(emailPropertyConfig.format?.('Test.User@Domain.Com')).toBe('test.user@domain.com');
  });

  it('should trim whitespace', () => {
    expect(emailPropertyConfig.format?.('  user@example.com  ')).toBe('user@example.com');
  });

  it('should format null as empty string', () => {
    expect(emailPropertyConfig.format?.(null)).toBe('');
  });

  it('should format undefined as empty string', () => {
    expect(emailPropertyConfig.format?.(undefined)).toBe('');
  });

  it('should handle non-string values', () => {
    expect(emailPropertyConfig.format?.(123 as any)).toBe('');
  });
});

// ==========================================
// Renderer Component Tests
// ==========================================

describe('EmailRenderer', () => {
  it('should render email as mailto link', () => {
    render(<EmailRenderer value="test@example.com" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');
    expect(link).toHaveTextContent('test@example.com');
  });

  it('should render email icon', () => {
    const { container } = render(<EmailRenderer value="test@example.com" property={mockProperty} readOnly={true} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<EmailRenderer value={null} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render empty state for undefined', () => {
    render(<EmailRenderer value={undefined} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render empty state for empty string', () => {
    render(<EmailRenderer value="" property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render empty state for non-string value', () => {
    render(<EmailRenderer value={123 as any} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmailRenderer value="test@example.com" property={mockProperty} readOnly={true} className="custom-class" />
    );
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

// ==========================================
// Editor Component Tests
// ==========================================

describe('EmailEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    render(
      <EmailEditor value="test@example.com" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('should render empty input for null', () => {
    render(
      <EmailEditor value={null} onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should render empty input for undefined', () => {
    render(
      <EmailEditor value={undefined} onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should have type="email" attribute', () => {
    render(
      <EmailEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should have placeholder text', () => {
    render(
      <EmailEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByPlaceholderText('email@example.com');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(
      <EmailEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('test@example.com');
  });

  it('should update local value when typing', async () => {
    const user = userEvent.setup();
    render(
      <EmailEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'user@test.com');

    expect(input.value).toBe('user@test.com');
  });

  it('should support autoFocus', () => {
    render(
      <EmailEditor value="" onChange={mockOnChange} property={mockProperty} autoFocus={true} />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('should call onBlur when blurred', async () => {
    const user = userEvent.setup();
    const mockOnBlur = vi.fn();
    
    render(
      <EmailEditor value="" onChange={mockOnChange} onBlur={mockOnBlur} property={mockProperty} />
    );

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab(); // Tab away to trigger blur

    expect(mockOnBlur).toHaveBeenCalled();
  });
});

// ==========================================
// Integration Tests
// ==========================================

describe('Email Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = 'old@example.com';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    // Read mode - display email
    let result = render(
      <EmailRenderer value={currentValue} property={mockProperty} readOnly={true} />
    );
    let link = screen.getByRole('link');
    expect(link).toHaveTextContent('old@example.com');
    result.unmount();

    // Edit mode - change email
    result = render(<EmailEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'new@example.com');
    expect(currentValue).toBe('new@example.com');
    result.unmount();

    // Read mode - display new email
    result = render(<EmailRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    link = screen.getByRole('link');
    expect(link).toHaveTextContent('new@example.com');
    expect(link).toHaveAttribute('href', 'mailto:new@example.com');
  });

  it('should validate email format', () => {
    const validEmail = 'valid@example.com';
    const invalidEmail = 'invalid-email';

    expect(emailPropertyConfig.validate?.(validEmail, mockProperty)).toBeNull();
    expect(emailPropertyConfig.validate?.(invalidEmail, mockProperty)).toBe('Invalid email format');
  });

  it('should format email to lowercase', () => {
    const mixedCaseEmail = 'User@EXAMPLE.Com';
    const formatted = emailPropertyConfig.format?.(mixedCaseEmail);
    
    expect(formatted).toBe('user@example.com');
  });

  it('should handle empty values gracefully', () => {
    render(<EmailRenderer value="" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    render(<EmailEditor value="" onChange={vi.fn()} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe('Email Property Edge Cases', () => {
  it('should handle very long email addresses', () => {
    const longEmail = 'very.long.email.address.with.many.dots@subdomain.example.com';
    
    expect(emailPropertyConfig.validate?.(longEmail, mockProperty)).toBeNull();
    
    render(<EmailRenderer value={longEmail} property={mockProperty} readOnly={true} />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(longEmail);
  });

  it('should handle email with special characters', () => {
    const specialEmail = 'user+tag@example.com';
    
    expect(emailPropertyConfig.validate?.(specialEmail, mockProperty)).toBeNull();
    
    render(<EmailRenderer value={specialEmail} property={mockProperty} readOnly={true} />);
    expect(screen.getByRole('link')).toHaveTextContent(specialEmail);
  });

  it('should handle email with numbers', () => {
    const numericEmail = 'user123@example456.com';
    
    expect(emailPropertyConfig.validate?.(numericEmail, mockProperty)).toBeNull();
  });

  it('should handle rapid typing in editor', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<EmailEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');
    
    // Should be called for each character (16 chars)
    expect(mockOnChange).toHaveBeenCalledTimes(16);
  });

  it('should handle email with international domains', () => {
    const intlEmail = 'user@example.co.uk';
    
    expect(emailPropertyConfig.validate?.(intlEmail, mockProperty)).toBeNull();
  });

  it('should handle email with subdomain', () => {
    const subdomainEmail = 'user@mail.example.com';
    
    expect(emailPropertyConfig.validate?.(subdomainEmail, mockProperty)).toBeNull();
  });

  it('should reject email with only spaces', () => {
    expect(emailPropertyConfig.validate?.('   ', mockProperty)).toBe('Invalid email format');
  });

  it('should handle copy-paste with whitespace', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<EmailEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.paste('  user@example.com  ');
    
    // Input type="email" may automatically trim, so check what was actually called
    expect(mockOnChange).toHaveBeenCalled();
    // Format should trim it
    expect(emailPropertyConfig.format?.('  user@example.com  ')).toBe('user@example.com');
  });
});
