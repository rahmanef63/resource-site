/**
 * Property Menu - Unit Tests
 * 
 * Tests for PropertyMenu component using registry-based menu builder.
 * 
 * Uses jsdom environment for better Radix UI compatibility.
 * 
 * Core functionality tested:
 * - Trigger button rendering
 * - Menu opens on click
 * - Field name shown in menu
 * - Menu item callbacks
 * - Dialog interactions
 * 
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertyMenu } from '../PropertyMenu';
import type { DatabaseField } from '../../../types';

// Mock toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Helper to create all callbacks for testing
function createAllCallbacks() {
  return {
    onRename: vi.fn(),
    onDuplicate: vi.fn(),
    onChangeType: vi.fn(),
    onHide: vi.fn(),
    onDelete: vi.fn(),
    onToggleRequired: vi.fn(),
    onInsertLeft: vi.fn(),
    onInsertRight: vi.fn(),
    onMoveLeft: vi.fn(),
    onMoveRight: vi.fn(),
    onSort: vi.fn(),
    onFilter: vi.fn(),
    onCalculate: vi.fn(),
    onWrap: vi.fn(),
  };
}

// Mock field data
const mockNumberField: DatabaseField = {
  _id: 'field_123' as any,
  _creationTime: Date.now(),
  tableId: 'table_456' as any,
  name: 'Price',
  type: 'number',
  position: 0,
  isRequired: false,
  isPrimary: false,
};

const mockSelectField: DatabaseField = {
  _id: 'field_select' as any,
  _creationTime: Date.now(),
  tableId: 'table_456' as any,
  name: 'Status',
  type: 'select',
  position: 1,
  isRequired: false,
  isPrimary: false,
  options: {
    selectOptions: [
      { id: 'opt1', name: 'Todo', color: '#6b7280' },
      { id: 'opt2', name: 'In Progress', color: '#3b82f6' },
      { id: 'opt3', name: 'Done', color: '#10b981' },
    ],
  },
};

describe('PropertyMenu - Basic Rendering', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    mockToast.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('should render default trigger button', () => {
    render(<PropertyMenu field={mockNumberField} />);
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    expect(trigger).toBeInTheDocument();
  });

  it('should render custom children as trigger', () => {
    render(
      <PropertyMenu field={mockNumberField}>
        <button>Custom Trigger</button>
      </PropertyMenu>
    );
    
    expect(screen.getByRole('button', { name: /custom trigger/i })).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    render(<PropertyMenu field={mockNumberField} onRename={vi.fn()} />);
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      // Should show field name as label in menu
      expect(screen.getByText('Price')).toBeInTheDocument();
    });
  });

  it('should have correct aria attributes on trigger', () => {
    render(<PropertyMenu field={mockNumberField} />);
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('type', 'button');
  });

  it('should show menu open state', async () => {
    render(<PropertyMenu field={mockNumberField} onRename={vi.fn()} />);
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    expect(trigger).toHaveAttribute('data-state', 'closed');
    
    await user.click(trigger);
    
    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
    });
  });
});

describe('PropertyMenu - Menu Items', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    mockToast.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('should show base menu items when callbacks provided', async () => {
    const callbacks = createAllCallbacks();
    
    render(<PropertyMenu field={mockNumberField} {...callbacks} />);
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    // Wait for menu to open and verify base items are present
    await waitFor(() => {
      expect(screen.getByText('Rename property')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Duplicate property')).toBeInTheDocument();
    expect(screen.getByText('Sort ascending')).toBeInTheDocument();
    expect(screen.getByText('Sort descending')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Delete property')).toBeInTheDocument();
  });

  it('should call onDuplicate when duplicate clicked', async () => {
    const onDuplicate = vi.fn();
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onDuplicate={onDuplicate}
        onRename={vi.fn()} // Need at least one callback to enable menu
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    // Wait for menu to fully render
    await waitFor(() => {
      expect(screen.getByText('Duplicate property')).toBeInTheDocument();
    });
    
    const duplicateItem = screen.getByText('Duplicate property');
    await user.click(duplicateItem);
    
    await waitFor(() => {
      expect(onDuplicate).toHaveBeenCalledWith('field_123');
    });
  });

  it('should call onSort with direction when sort clicked', async () => {
    const onSort = vi.fn();
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onSort={onSort}
        onRename={vi.fn()}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Sort ascending')).toBeInTheDocument();
    });
    
    // Click sort ascending
    const sortAscItem = screen.getByText('Sort ascending');
    await user.click(sortAscItem);
    
    await waitFor(() => {
      expect(onSort).toHaveBeenCalledWith('field_123', 'asc');
    });
  });

  it('should call onFilter when filter clicked', async () => {
    const onFilter = vi.fn();
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onFilter={onFilter}
        onRename={vi.fn()}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Filter')).toBeInTheDocument();
    });
    
    const filterItem = screen.getByText('Filter');
    await user.click(filterItem);
    
    await waitFor(() => {
      expect(onFilter).toHaveBeenCalledWith('field_123');
    });
  });

  it('should open rename dialog when rename clicked', async () => {
    const onRename = vi.fn();
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onRename={onRename}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Rename property')).toBeInTheDocument();
    });
    
    const renameItem = screen.getByText('Rename property');
    await user.click(renameItem);
    
    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Dialog should have input with current name
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Price');
  });

  it('should open delete dialog when delete clicked', async () => {
    const onDelete = vi.fn();
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onDelete={onDelete}
        onRename={vi.fn()}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Delete property')).toBeInTheDocument();
    });
    
    const deleteItem = screen.getByText('Delete property');
    await user.click(deleteItem);
    
    // Wait for alert dialog to appear
    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
    
    // Should show confirmation text with property name
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText(/delete property/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/price/i)).toBeInTheDocument();
    // Should have Cancel and Delete buttons
    expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
});

describe('PropertyMenu - Error Handling', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    mockToast.mockClear();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('should show toast on duplicate error', async () => {
    const onDuplicate = vi.fn().mockRejectedValue(new Error('Duplicate failed'));
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onDuplicate={onDuplicate}
        onRename={vi.fn()}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Duplicate property')).toBeInTheDocument();
    });
    
    const duplicateItem = screen.getByText('Duplicate property');
    await user.click(duplicateItem);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Failed to duplicate property',
        })
      );
    });
  });

  it('should show toast on rename error', async () => {
    const onRename = vi.fn().mockRejectedValue(new Error('Rename failed'));
    
    render(
      <PropertyMenu 
        field={mockNumberField} 
        onRename={onRename}
      />
    );
    
    const trigger = screen.getByRole('button', { name: /property menu/i });
    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Rename property')).toBeInTheDocument();
    });
    
    const renameItem = screen.getByText('Rename property');
    await user.click(renameItem);
    
    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Change the name and confirm
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Name');
    
    // Find and click the confirm button (usually "Save" or similar)
    const confirmButton = screen.getByRole('button', { name: /save|confirm|rename/i });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Failed to rename property',
        })
      );
    });
  });
});
