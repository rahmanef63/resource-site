/**
 * Place Property - Unit Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { placePropertyConfig } from './config';
import { PlaceRenderer } from './PlaceRenderer';
import { PlaceEditor } from './PlaceEditor';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

const mockProperty: Property = {
  name: 'Location',
  type: 'place',
  key: 'location',
};

describe('placePropertyConfig', () => {
  it('should have correct type', () => {
    expect(placePropertyConfig.type).toBe('place');
  });

  it('should be in extended category', () => {
    expect(placePropertyConfig.category).toBe('extended');
  });

  it('should be editable', () => {
    expect(placePropertyConfig.isEditable).toBe(true);
  });
});

describe('placePropertyConfig.validate', () => {
  it('should accept string addresses', () => {
    expect(placePropertyConfig.validate?.('123 Main St, City', mockProperty)).toBeNull();
  });

  it('should accept place objects with valid coordinates', () => {
    expect(placePropertyConfig.validate?.({ address: 'NYC', lat: 40.7128, lng: -74.0060 }, mockProperty)).toBeNull();
  });

  it('should reject invalid latitude', () => {
    expect(placePropertyConfig.validate?.({ lat: 100, lng: 0 }, mockProperty)).toBe('Latitude must be between -90 and 90');
  });

  it('should reject invalid longitude', () => {
    expect(placePropertyConfig.validate?.({ lat: 0, lng: 200 }, mockProperty)).toBe('Longitude must be between -180 and 180');
  });

  it('should accept null/undefined', () => {
    expect(placePropertyConfig.validate?.(null, mockProperty)).toBeNull();
    expect(placePropertyConfig.validate?.(undefined, mockProperty)).toBeNull();
  });
});

describe('placePropertyConfig.format', () => {
  it('should format string addresses', () => {
    expect(placePropertyConfig.format?.('New York, NY')).toBe('New York, NY');
  });

  it('should format place objects', () => {
    expect(placePropertyConfig.format?.({ address: 'San Francisco, CA' })).toBe('San Francisco, CA');
  });

  it('should return empty string for null', () => {
    expect(placePropertyConfig.format?.(null)).toBe('');
  });
});

describe('PlaceRenderer', () => {
  it('should render location as Maps link', () => {
    render(<PlaceRenderer value="New York, NY" property={mockProperty} readOnly={true} />);
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('New York, NY');
    expect(link).toHaveAttribute('href');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render map pin icon', () => {
    const { container } = render(<PlaceRenderer value="NYC" property={mockProperty} readOnly={true} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render no location state for null', () => {
    render(<PlaceRenderer value={null} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('No location')).toBeInTheDocument();
  });

  it('should handle place objects with coordinates', () => {
    render(<PlaceRenderer value={{ address: 'NYC', lat: 40.7128, lng: -74.0060 }} property={mockProperty} readOnly={true} />);
    expect(screen.getByText('NYC')).toBeInTheDocument();
  });
});

describe('PlaceEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  it('should render input with address', () => {
    render(<PlaceEditor value="New York, NY" onChange={mockOnChange} property={mockProperty} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('New York, NY');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    render(<PlaceEditor value="" onChange={mockOnChange} property={mockProperty} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'NYC');
    
    expect(mockOnChange).toHaveBeenCalled();
  });
});
