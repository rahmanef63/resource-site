/**
 * Created By Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createdByPropertyConfig } from './config';
import { CreatedByRenderer } from './CreatedByRenderer';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Creator',
  type: 'created_by',
  key: 'creator',
};

describe('createdByPropertyConfig', () => {
  it('should have correct type', () => {
    expect(createdByPropertyConfig.type).toBe('created_by');
  });

  it('should be auto-generated and read-only', () => {
    expect(createdByPropertyConfig.isAuto).toBe(true);
    expect(createdByPropertyConfig.isEditable).toBe(false);
  });

  it('should be in auto category', () => {
    expect(createdByPropertyConfig.category).toBe('auto');
  });
});

describe('createdByPropertyConfig.validate', () => {
  it('should accept string user IDs', () => {
    expect(createdByPropertyConfig.validate?.('user-123', mockProperty)).toBeNull();
  });

  it('should accept user objects', () => {
    expect(createdByPropertyConfig.validate?.({ id: '123', name: 'John' }, mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(createdByPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(createdByPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });
});

describe('createdByPropertyConfig.format', () => {
  it('should format user object with name', () => {
    expect(createdByPropertyConfig.format?.({ name: 'John Doe', email: 'john@example.com' })).toBe('John Doe');
  });

  it('should format user object with email if no name', () => {
    expect(createdByPropertyConfig.format?.({ email: 'john@example.com' })).toBe('john@example.com');
  });

  it('should format string values', () => {
    expect(createdByPropertyConfig.format?.('user-123')).toBe('user-123');
  });

  it('should return empty string for null', () => {
    expect(createdByPropertyConfig.format?.(null)).toBe('');
  });
});

describe('CreatedByRenderer', () => {
  it('should render user with avatar and name', () => {
    render(<CreatedByRenderer value={{ name: 'John Doe', email: 'john@example.com' }} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render initials in avatar', () => {
    const { container } = render(<CreatedByRenderer value={{ name: 'John Doe' }} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render unknown state for null', () => {
    render(<CreatedByRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle string values', () => {
    render(<CreatedByRenderer value="John Doe" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
