/**
 * People Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { peoplePropertyConfig } from './config';
import { PeopleRenderer } from './PeopleRenderer';
import { PeopleEditor } from './PeopleEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Assignees',
  type: 'people',
  key: 'assignees',
};

describe('peoplePropertyConfig', () => {
  it('should have correct type', () => {
    expect(peoplePropertyConfig.type).toBe('people');
  });

  it('should be in core category', () => {
    expect(peoplePropertyConfig.category).toBe('core');
  });

  it('should be editable', () => {
    expect(peoplePropertyConfig.isEditable).toBe(true);
  });
});

describe('peoplePropertyConfig.validate', () => {
  it('should accept arrays of users', () => {
    expect(peoplePropertyConfig.validate?.([{ name: 'John' }, { name: 'Jane' }], mockProperty)).toBeNull();
  });

  it('should accept single user object', () => {
    expect(peoplePropertyConfig.validate?.({ name: 'John Doe' }, mockProperty)).toBeNull();
  });

  it('should accept string values', () => {
    expect(peoplePropertyConfig.validate?.('John Doe', mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(peoplePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(peoplePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });
});

describe('peoplePropertyConfig.format', () => {
  it('should format array of users as comma-separated names', () => {
    const users = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
    expect(peoplePropertyConfig.format?.(users)).toBe('John, Jane, Bob');
  });

  it('should format single user object', () => {
    expect(peoplePropertyConfig.format?.({ name: 'John Doe' })).toBe('John Doe');
  });

  it('should format string values', () => {
    expect(peoplePropertyConfig.format?.('John Doe')).toBe('John Doe');
  });

  it('should return empty string for null', () => {
    expect(peoplePropertyConfig.format?.(null)).toBe('');
  });
});

describe('PeopleRenderer', () => {
  it('should render array of users with avatars', () => {
    const users = [{ name: 'John Doe' }, { name: 'Jane Smith' }];
    render(<PeopleRenderer value={users} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('should render single user', () => {
    render(<PeopleRenderer value={{ name: 'John Doe' }} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<PeopleRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should handle empty array', () => {
    const { container } = render(<PeopleRenderer value={[]} property={mockProperty} readOnly={true} />);
    // Empty array renders empty flex container
    expect(container.querySelector('.flex')).toBeInTheDocument();
  });
});

describe('PeopleEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with comma-separated names', () => {
    const users = [{ name: 'John' }, { name: 'Jane' }];
    render(<PeopleEditor value={users} onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('John, Jane');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<PeopleEditor value={[]} onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'John');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});
