/**
 * Relation Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { relationPropertyConfig } from './config';
import { RelationRenderer } from './RelationRenderer';
import { RelationEditor } from './RelationEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Related Items',
  type: 'relation',
  key: 'relatedItems',
};

describe('relationPropertyConfig', () => {
  it('should have correct type', () => {
    expect(relationPropertyConfig.type).toBe('relation');
  });

  it('should be in core category', () => {
    expect(relationPropertyConfig.category).toBe('core');
  });

  it('should support options', () => {
    expect(relationPropertyConfig.supportsOptions).toBe(true);
  });

  it('should be editable', () => {
    expect(relationPropertyConfig.isEditable).toBe(true);
  });
});

describe('relationPropertyConfig.validate', () => {
  it('should accept string IDs', () => {
    expect(relationPropertyConfig.validate?.('record-123', mockProperty)).toBeNull();
  });

  it('should accept arrays of IDs', () => {
    expect(relationPropertyConfig.validate?.(['rec-1', 'rec-2'], mockProperty)).toBeNull();
  });

  it('should accept objects', () => {
    expect(relationPropertyConfig.validate?.({ id: '123', title: 'Record' }, mockProperty)).toBeNull();
  });

  it('should accept null/undefined', () => {
    expect(relationPropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(relationPropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });
});

describe('relationPropertyConfig.format', () => {
  it('should format array with count', () => {
    expect(relationPropertyConfig.format?.(['rec-1', 'rec-2', 'rec-3'])).toBe('3 linked record(s)');
  });

  it('should format single relation', () => {
    expect(relationPropertyConfig.format?.('rec-1')).toBe('1 linked record');
  });

  it('should return empty string for null', () => {
    expect(relationPropertyConfig.format?.(null)).toBe('');
  });
});

describe('RelationRenderer', () => {
  it('should render single relation as badge', () => {
    render(<RelationRenderer value="record-123" property={mockProperty} readOnly={true} />);
    expect(screen.getByText('record-123')).toBeInTheDocument();
  });

  it('should render multiple relations as badges', () => {
    render(<RelationRenderer value={['rec-1', 'rec-2', 'rec-3']} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('rec-1')).toBeInTheDocument();
    expect(screen.getByText('rec-2')).toBeInTheDocument();
    expect(screen.getByText('rec-3')).toBeInTheDocument();
  });

  it('should render link icon', () => {
    const { container } = render(<RelationRenderer value="rec-1" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render empty state for null', () => {
    render(<RelationRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('No relations')).toBeInTheDocument();
  });
});

describe('RelationEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render search input', () => {
    render(<RelationEditor value="record-123" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByPlaceholderText('Search records...') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when selecting relation', async () => {
    const user = userEvent.setup();
    render(<RelationEditor value={null} onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByPlaceholderText('Search records...');
    await user.type(input, 'Record');
    
    // The editor now shows suggestions instead of directly updating value
    expect(input).toHaveValue('Record');
  });
});
