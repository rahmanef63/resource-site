/**
 * Files Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filesPropertyConfig } from './config';
import { FilesRenderer } from './FilesRenderer';
import { FilesEditor } from './FilesEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Attachments',
  type: 'files',
  key: 'attachments',
};

describe('filesPropertyConfig', () => {
  it('should have correct type', () => {
    expect(filesPropertyConfig.type).toBe('files');
  });

  it('should be in core category', () => {
    expect(filesPropertyConfig.category).toBe('core');
  });

  it('should be editable', () => {
    expect(filesPropertyConfig.isEditable).toBe(true);
  });
});

describe('filesPropertyConfig.validate', () => {
  it('should accept arrays of files', () => {
    expect(filesPropertyConfig.validate?.([{ name: 'file.pdf' }], mockProperty)).toBeNull();
  });

  it('should accept file objects', () => {
    expect(filesPropertyConfig.validate?.({ name: 'file.pdf', url: 'https://...' }, mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(filesPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(filesPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });

  it('should reject invalid types', () => {
    expect(filesPropertyConfig.validate?.('string' as any, mockProperty)).toBe('Files must be an array or object');
  });
});

describe('filesPropertyConfig.format', () => {
  it('should format array with filenames', () => {
    expect(filesPropertyConfig.format?.([{ name: 'a.pdf' }, { name: 'b.png' }])).toBe('a.pdf, b.png');
  });

  it('should format single file', () => {
    expect(filesPropertyConfig.format?.({ name: 'file.pdf' })).toBe('file.pdf');
  });

  it('should return empty string for null', () => {
    expect(filesPropertyConfig.format?.(null)).toBe('');
  });
});

describe('FilesRenderer', () => {
  it('should render files as badges', () => {
    const files = [
      { name: 'file1.pdf', url: 'https://example.com/file1.pdf' },
      { name: 'file2.png', url: 'https://example.com/file2.png' }
    ];
    render(<FilesRenderer value={files} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.png')).toBeInTheDocument();
  });

  it('should render paperclip icon', () => {
    const { container } = render(<FilesRenderer value={[{ name: 'file.pdf' }]} property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<FilesRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('No files')).toBeInTheDocument();
  });

  it('should render single file', () => {
    render(<FilesRenderer value={{ name: 'doc.pdf' }} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
  });
});

describe('FilesEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input for file names', () => {
    const { container } = render(<FilesEditor value={[]} onChange={mockOnChange} property={mockProperty} />);
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('should display file names', () => {
    const files = [{ name: 'file1.pdf' }, { name: 'file2.png' }];
    render(<FilesEditor value={files} onChange={mockOnChange} property={mockProperty} />);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.png')).toBeInTheDocument();
  });
});
