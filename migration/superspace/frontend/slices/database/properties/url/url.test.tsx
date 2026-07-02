/**
 * URL Property - Unit Tests
 * 
 * Tests for the URL property type including:
 * - Configuration validation
 * - URL format validation
 * - Renderer component (with external links)
 * - Editor component
 * - Integration scenarios
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { urlPropertyConfig } from './config';
import { UrlRenderer } from './UrlRenderer';
import { UrlEditor } from './UrlEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// ==========================================
// Mock Property Object
// ==========================================

const mockProperty: Property = {
  key: 'test-url-prop',
  name: 'Website',
  type: 'url',
};

// ==========================================
// Configuration Tests
// ==========================================

describe('urlPropertyConfig', () => {
  it('should have correct type', () => {
    expect(urlPropertyConfig.type).toBe('url');
  });

  it('should have correct label', () => {
    expect(urlPropertyConfig.label).toBe('URL');
  });

  it('should be in core category', () => {
    expect(urlPropertyConfig.category).toBe('core');
  });

  it('should be version 2.0', () => {
    expect(urlPropertyConfig.version).toBe('2.0');
  });

  it('should have correct capabilities', () => {
    expect(urlPropertyConfig.supportsOptions).toBe(false);
    expect(urlPropertyConfig.supportsRequired).toBe(false);
    expect(urlPropertyConfig.supportsUnique).toBe(false);
    expect(urlPropertyConfig.supportsDefault).toBe(true);
    expect(urlPropertyConfig.isAuto).toBe(false);
    expect(urlPropertyConfig.isEditable).toBe(true);
  });

  it('should have icon component', () => {
    expect(urlPropertyConfig.icon).toBeDefined();
  });

  it('should have correct tags', () => {
    expect(urlPropertyConfig.tags).toContain('link');
    expect(urlPropertyConfig.tags).toContain('web');
  });
});

// ==========================================
// Validation Tests
// ==========================================

describe('urlPropertyConfig.validate', () => {
  it('should accept valid HTTP URLs', () => {
    expect(urlPropertyConfig.validate?.('http://example.com', mockProperty)).toBeNull();
    expect(urlPropertyConfig.validate?.('http://www.example.com', mockProperty)).toBeNull();
  });

  it('should accept valid HTTPS URLs', () => {
    expect(urlPropertyConfig.validate?.('https://example.com', mockProperty)).toBeNull();
    expect(urlPropertyConfig.validate?.('https://www.example.com/path', mockProperty)).toBeNull();
  });

  it('should accept URLs with paths', () => {
    expect(urlPropertyConfig.validate?.('https://example.com/path/to/page', mockProperty)).toBeNull();
  });

  it('should accept URLs with query parameters', () => {
    expect(urlPropertyConfig.validate?.('https://example.com?param=value', mockProperty)).toBeNull();
    expect(urlPropertyConfig.validate?.('https://example.com?a=1&b=2', mockProperty)).toBeNull();
  });

  it('should accept URLs with anchors', () => {
    expect(urlPropertyConfig.validate?.('https://example.com#section', mockProperty)).toBeNull();
  });

  it('should accept URLs with ports', () => {
    expect(urlPropertyConfig.validate?.('http://localhost:3000', mockProperty)).toBeNull();
  });

  it('should accept null value', () => {
    expect(urlPropertyConfig.validate?.(null, mockProperty)).toBeNull();
  });

  it('should accept undefined value', () => {
    expect(urlPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should accept empty string', () => {
    expect(urlPropertyConfig.validate?.('', mockProperty)).toBeNull();
  });

  it('should reject invalid URL format - missing protocol', () => {
    expect(urlPropertyConfig.validate?.('example.com', mockProperty)).toBe('Invalid URL format');
  });

  it('should accept URLs with custom protocols', () => {
    // URL constructor accepts various protocols including 'invalid://'
    expect(urlPropertyConfig.validate?.('invalid://example.com', mockProperty)).toBeNull();
    expect(urlPropertyConfig.validate?.('ftp://example.com', mockProperty)).toBeNull();
  });

  it('should reject invalid URL format - malformed', () => {
    expect(urlPropertyConfig.validate?.('not a url', mockProperty)).toBe('Invalid URL format');
  });

  it('should reject non-string values', () => {
    expect(urlPropertyConfig.validate?.(123 as any, mockProperty)).toBe('URL must be text');
    expect(urlPropertyConfig.validate?.({ url: 'https://test.com' } as any, mockProperty)).toBe('URL must be text');
  });
});

// ==========================================
// Formatting Tests
// ==========================================

describe('urlPropertyConfig.format', () => {
  it('should trim whitespace', () => {
    expect(urlPropertyConfig.format?.('  https://example.com  ')).toBe('https://example.com');
  });

  it('should preserve URL as-is', () => {
    expect(urlPropertyConfig.format?.('https://example.com')).toBe('https://example.com');
    expect(urlPropertyConfig.format?.('http://EXAMPLE.COM')).toBe('http://EXAMPLE.COM');
  });

  it('should format null as empty string', () => {
    expect(urlPropertyConfig.format?.(null)).toBe('');
  });

  it('should format undefined as empty string', () => {
    expect(urlPropertyConfig.format?.(undefined)).toBe('');
  });

  it('should handle non-string values', () => {
    expect(urlPropertyConfig.format?.(123 as any)).toBe('');
  });
});

// ==========================================
// Renderer Component Tests
// ==========================================

describe('UrlRenderer', () => {
  it('should render URL as external link', () => {
    render(<UrlRenderer value="https://example.com" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display hostname without www', () => {
    render(<UrlRenderer value="https://www.example.com/path" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('example.com');
  });

  it('should display hostname with subdomain', () => {
    render(<UrlRenderer value="https://blog.example.com" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('blog.example.com');
  });

  it('should render link icon', () => {
    const { container } = render(<UrlRenderer value="https://example.com" property={mockProperty} readOnly={true} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<UrlRenderer value={null} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render empty state for undefined', () => {
    render(<UrlRenderer value={undefined} property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render empty state for empty string', () => {
    render(<UrlRenderer value="" property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should render invalid URL as plain text', () => {
    render(<UrlRenderer value="not a url" property={mockProperty} readOnly={true} />);
    
    expect(screen.getByText('not a url')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <UrlRenderer value="https://example.com" property={mockProperty} readOnly={true} className="custom-class" />
    );
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

// ==========================================
// Editor Component Tests
// ==========================================

describe('UrlEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with value', () => {
    render(
      <UrlEditor value="https://example.com" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('https://example.com');
  });

  it('should render empty input for null', () => {
    render(
      <UrlEditor value={null} onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should render empty input for undefined', () => {
    render(
      <UrlEditor value={undefined} onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should have type="url" attribute', () => {
    render(
      <UrlEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'url');
  });

  it('should have placeholder text', () => {
    render(
      <UrlEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByPlaceholderText('https://example.com');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(
      <UrlEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'https://test.com');

    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('https://test.com');
  });

  it('should update local value when typing', async () => {
    const user = userEvent.setup();
    render(
      <UrlEditor value="" onChange={mockOnChange} property={mockProperty} />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'https://example.com');

    expect(input.value).toBe('https://example.com');
  });

  it('should support autoFocus', () => {
    render(
      <UrlEditor value="" onChange={mockOnChange} property={mockProperty} autoFocus={true} />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('should call onBlur when blurred', async () => {
    const user = userEvent.setup();
    const mockOnBlur = vi.fn();
    
    render(
      <UrlEditor value="" onChange={mockOnChange} onBlur={mockOnBlur} property={mockProperty} />
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

describe('URL Property Integration', () => {
  it('should work in read-edit-read cycle', async () => {
    const user = userEvent.setup();
    let currentValue = 'https://old-site.com';
    const onChange = (newValue: unknown) => {
      currentValue = String(newValue);
    };

    // Read mode - display URL
    let result = render(
      <UrlRenderer value={currentValue} property={mockProperty} readOnly={true} />
    );
    let link = screen.getByRole('link');
    expect(link).toHaveTextContent('old-site.com');
    result.unmount();

    // Edit mode - change URL
    result = render(<UrlEditor value={currentValue} property={mockProperty} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'https://new-site.com');
    expect(currentValue).toBe('https://new-site.com');
    result.unmount();

    // Read mode - display new URL
    result = render(<UrlRenderer value={currentValue} property={mockProperty} readOnly={true} />);
    link = screen.getByRole('link');
    expect(link).toHaveTextContent('new-site.com');
    expect(link).toHaveAttribute('href', 'https://new-site.com');
  });

  it('should validate URL format', () => {
    const validUrl = 'https://example.com';
    const invalidUrl = 'not a url';

    expect(urlPropertyConfig.validate?.(validUrl, mockProperty)).toBeNull();
    expect(urlPropertyConfig.validate?.(invalidUrl, mockProperty)).toBe('Invalid URL format');
  });

  it('should format URL by trimming', () => {
    const urlWithSpaces = '  https://example.com  ';
    const formatted = urlPropertyConfig.format?.(urlWithSpaces);
    
    expect(formatted).toBe('https://example.com');
  });

  it('should handle empty values gracefully', () => {
    render(<UrlRenderer value="" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    render(<UrlEditor value="" onChange={vi.fn()} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

// ==========================================
// Edge Cases
// ==========================================

describe('URL Property Edge Cases', () => {
  it('should handle very long URLs', () => {
    const longUrl = 'https://example.com/very/long/path/with/many/segments?param1=value1&param2=value2&param3=value3#section';
    
    expect(urlPropertyConfig.validate?.(longUrl, mockProperty)).toBeNull();
    
    render(<UrlRenderer value={longUrl} property={mockProperty} readOnly={true} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', longUrl);
  });

  it('should handle localhost URLs', () => {
    const localhostUrl = 'http://localhost:3000';
    
    expect(urlPropertyConfig.validate?.(localhostUrl, mockProperty)).toBeNull();
    
    render(<UrlRenderer value={localhostUrl} property={mockProperty} readOnly={true} />);
    expect(screen.getByRole('link')).toHaveTextContent('localhost');
  });

  it('should handle IP address URLs', () => {
    const ipUrl = 'http://192.168.1.1:8080';
    
    expect(urlPropertyConfig.validate?.(ipUrl, mockProperty)).toBeNull();
  });

  it('should handle URLs with special characters in path', () => {
    const specialUrl = 'https://example.com/path-with-dashes/and_underscores';
    
    expect(urlPropertyConfig.validate?.(specialUrl, mockProperty)).toBeNull();
  });

  it('should handle rapid typing in editor', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(<UrlEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'https://test.com');
    
    // Should be called for each character (16 chars)
    expect(mockOnChange).toHaveBeenCalledTimes(16);
  });

  it('should handle URLs with www prefix', () => {
    render(<UrlRenderer value="https://www.example.com" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    // Should strip www from display
    expect(link).toHaveTextContent('example.com');
    // But preserve in href
    expect(link).toHaveAttribute('href', 'https://www.example.com');
  });

  it('should handle URLs with subdomains', () => {
    render(<UrlRenderer value="https://blog.example.com" property={mockProperty} readOnly={true} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('blog.example.com');
  });

  it('should handle FTP URLs', () => {
    const ftpUrl = 'ftp://files.example.com';
    
    // URL constructor should accept FTP
    expect(urlPropertyConfig.validate?.(ftpUrl, mockProperty)).toBeNull();
  });

  it('should reject URLs with only spaces', () => {
    expect(urlPropertyConfig.validate?.('   ', mockProperty)).toBe('Invalid URL format');
  });

  it('should handle protocol-relative URLs', () => {
    const protocolRelative = '//example.com';
    
    // This is technically invalid for URL constructor without base
    expect(urlPropertyConfig.validate?.(protocolRelative, mockProperty)).toBe('Invalid URL format');
  });
});
