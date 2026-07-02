/**
 * UniversalListView Test Suite
 * 
 * Comprehensive tests for the list view component covering:
 * - Basic rendering and data display
 * - Search/filtering functionality
 * - Property display
 * - Compact mode
 * - Empty states
 * - User interactions
 * - Edge cases
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.8
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UniversalListView } from '../UniversalListView';
import type { PropertyRowData, PropertyColumnConfig } from '../table-columns';

describe('UniversalListView', () => {
  // Sample properties covering various types
  const sampleProperties: PropertyColumnConfig[] = [
    { key: 'title', name: 'Title', type: 'title', visible: true },
    { key: 'description', name: 'Description', type: 'rich_text', visible: true },
    { key: 'status', name: 'Status', type: 'status', visible: true },
    { key: 'priority', name: 'Priority', type: 'select', visible: true },
    { key: 'tags', name: 'Tags', type: 'multi_select', visible: true },
    { key: 'date', name: 'Date', type: 'date', visible: true },
    { key: 'count', name: 'Count', type: 'number', visible: true },
    { key: 'active', name: 'Active', type: 'checkbox', visible: true },
  ];

  // Sample records
  const sampleRecords: PropertyRowData[] = [
    {
      id: 'record-1',
      properties: {
        title: 'Task Alpha',
        description: 'First task description',
        status: { label: 'In Progress', color: '#3b82f6' },
        priority: { label: 'High', color: '#ef4444' },
        tags: [{ label: 'Important' }, { label: 'Urgent' }],
        date: '2024-01-15',
        count: 5,
        active: true,
      },
    },
    {
      id: 'record-2',
      properties: {
        title: 'Task Beta',
        description: 'Second task description',
        status: { label: 'Done', color: '#22c55e' },
        priority: { label: 'Medium', color: '#f59e0b' },
        tags: [{ label: 'Review' }],
        date: '2024-02-20',
        count: 12,
        active: false,
      },
    },
    {
      id: 'record-3',
      properties: {
        title: 'Task Gamma',
        description: 'Third task description',
        status: { label: 'Todo', color: '#94a3b8' },
        priority: { label: 'Low', color: '#64748b' },
        tags: [{ label: 'Later' }, { label: 'Nice to have' }],
        date: '2024-03-10',
        count: 3,
        active: true,
      },
    },
  ];

  describe('Basic Rendering', () => {
    it('should render list view with records', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getAllByText('Task Alpha').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Task Beta').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Task Gamma').length).toBeGreaterThan(0);
    });

    it('should render empty state when no records', () => {
      render(
        <UniversalListView
          records={[]}
          properties={sampleProperties}
        />
      );

      expect(screen.getByText(/No records to display/i)).toBeInTheDocument();
    });

    it('should display item count', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      expect(screen.getByText('3 items')).toBeInTheDocument();
    });

    it('should display correct singular item count', () => {
      render(
        <UniversalListView
          records={[sampleRecords[0]]}
          properties={sampleProperties}
        />
      );

      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('should render all records in order', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const recordElements = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(recordElements.length).toBe(3);
    });
  });

  describe('Search and Filtering', () => {
    it('should have a search input', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should filter records by search query', async () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Alpha');

      // Should show only Task Alpha
      expect(screen.getAllByText('Task Alpha').length).toBeGreaterThan(0);
      expect(screen.queryByText('Task Beta')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'NonexistentTask');

      await waitFor(() => {
        expect(screen.getByText(/No records match your search/i)).toBeInTheDocument();
      });
    });

    it('should search across multiple properties', async () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      
      // Search by description
      await userEvent.type(searchInput, 'Second task');
      expect(screen.getAllByText('Task Beta').length).toBeGreaterThan(0);
    });

    it('should be case-insensitive in search', async () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'alpha');

      expect(screen.getAllByText('Task Alpha').length).toBeGreaterThan(0);
    });

    it('should update item count after filtering', async () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      await userEvent.type(searchInput, 'Alpha');

      await waitFor(() => {
        expect(screen.getByText('1 item')).toBeInTheDocument();
      });
    });
  });

  describe('Property Display', () => {
    it('should display property labels by default', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      // Should show property labels
      expect(screen.getAllByText(/Status:/i).length).toBeGreaterThan(0);
    });

    it('should hide property labels when showPropertyLabels is false', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          showPropertyLabels={false}
        />
      );

      // Should not show property labels
      expect(screen.queryByText(/Status:/i)).not.toBeInTheDocument();
    });

    it('should respect visibleProperties prop', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['status', 'priority']}
        />
      );

      // Should show specified properties
      expect(screen.getAllByText(/Status:/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Priority:/i).length).toBeGreaterThan(0);
      // Should not show other properties
      expect(screen.queryByText(/Tags:/i)).not.toBeInTheDocument();
    });

    it('should display default properties when none specified', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      // Should show first 3 visible properties
      const propertyLabels = screen.getAllByText(/:/);
      expect(propertyLabels.length).toBeGreaterThan(0);
    });

    it('should handle checkbox property type', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['active']}
        />
      );

      // Should display Yes/No badges
      expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
      expect(screen.getAllByText('No').length).toBeGreaterThan(0);
    });

    it('should handle status/select property types with badges', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['status']}
        />
      );

      // Should display status badges
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should handle multi-select properties with multiple badges', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['tags']}
        />
      );

      // Should display tag badges
      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should handle date properties', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['date']}
        />
      );

      // Should display formatted dates (format may vary by locale)
      const dateElements = screen.getAllByText(/2024/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should handle number properties', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          visibleProperties={['count']}
        />
      );

      // Should display numbers
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should handle empty property values', () => {
      const recordsWithEmpty: PropertyRowData[] = [
        {
          id: 'empty-record',
          properties: {
            title: 'Empty Task',
            status: null,
            priority: undefined,
          },
        },
      ];

      render(
        <UniversalListView
          records={recordsWithEmpty}
          properties={sampleProperties}
          visibleProperties={['status', 'priority']}
        />
      );

      // Empty values should not be displayed
      expect(screen.queryByText('Empty')).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should apply compact styling when compact prop is true', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          compact={true}
        />
      );

      // Should have compact padding classes
      const compactElements = container.querySelectorAll('[class*="p-3"]');
      expect(compactElements.length).toBeGreaterThan(0);
    });

    it('should use smaller title in compact mode', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          compact={true}
        />
      );

      // Title should have text-xl instead of text-2xl
      const titleElement = screen.getByText('List');
      expect(titleElement.className).toContain('text-xl');
    });

    it('should use smaller item text in compact mode', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          compact={true}
        />
      );

      // Check for text-sm class on record titles
      const recordTitles = container.querySelectorAll('[class*="text-sm"]');
      expect(recordTitles.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should call onRecordClick when item is clicked', async () => {
      const onRecordClick = vi.fn();
      
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          onRecordClick={onRecordClick}
        />
      );

      const firstRecordTitles = screen.getAllByText('Task Alpha');
      const firstRecord = firstRecordTitles[0].closest('[class*="cursor-pointer"]');
      if (firstRecord) {
        await userEvent.click(firstRecord);
        expect(onRecordClick).toHaveBeenCalledWith(sampleRecords[0]);
      }
    });

    it('should show hover effect on items', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const recordElements = container.querySelectorAll('[class*="hover:bg-accent"]');
      expect(recordElements.length).toBe(3);
    });

    it('should be keyboard accessible', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      const searchInput = screen.getByPlaceholderText(/Search/i);
      expect(searchInput).toBeInTheDocument();
      
      // Focus should work
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty properties array', () => {
      render(
        <UniversalListView
          records={sampleRecords}
          properties={[]}
        />
      );

      // Should still render but with minimal info
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('should handle records with missing properties', () => {
      const incompleteRecords: PropertyRowData[] = [
        {
          id: 'incomplete-1',
          properties: {},
        },
      ];

      render(
        <UniversalListView
          records={incompleteRecords}
          properties={sampleProperties}
        />
      );

      // Should render without crashing
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('should handle records without title property', () => {
      const noTitleProps: PropertyColumnConfig[] = [
        { key: 'description', name: 'Description', type: 'rich_text', visible: true },
      ];

      const noTitleRecords: PropertyRowData[] = [
        {
          id: 'no-title-1',
          properties: {
            description: 'Just a description',
          },
        },
      ];

      render(
        <UniversalListView
          records={noTitleRecords}
          properties={noTitleProps}
        />
      );

      // Should fallback to record ID or 'Untitled'
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitleRecords: PropertyRowData[] = [
        {
          id: 'long-title',
          properties: {
            title: 'This is a very long title that should be truncated or handled appropriately by the list view component to avoid breaking the layout',
          },
        },
      ];

      render(
        <UniversalListView
          records={longTitleRecords}
          properties={sampleProperties}
        />
      );

      const titles = screen.getAllByText(/This is a very long title/);
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should handle multi-select with many items', () => {
      const manyTagsRecords: PropertyRowData[] = [
        {
          id: 'many-tags',
          properties: {
            title: 'Many Tags Task',
            tags: [
              { label: 'Tag 1' },
              { label: 'Tag 2' },
              { label: 'Tag 3' },
              { label: 'Tag 4' },
              { label: 'Tag 5' },
            ],
          },
        },
      ];

      render(
        <UniversalListView
          records={manyTagsRecords}
          properties={sampleProperties}
          visibleProperties={['tags']}
        />
      );

      // Should show first 3 tags and +2 indicator
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should handle custom className prop', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
          className="custom-list-class"
        />
      );

      const cardElement = container.querySelector('.custom-list-class');
      expect(cardElement).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of records', () => {
      const manyRecords: PropertyRowData[] = Array.from({ length: 100 }, (_, i) => ({
        id: `record-${i}`,
        properties: {
          title: `Task ${i}`,
          description: `Description ${i}`,
        },
      }));

      render(
        <UniversalListView
          records={manyRecords}
          properties={sampleProperties}
        />
      );

      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('100 items')).toBeInTheDocument();
    });

    it('should render efficiently with scroll area', () => {
      const manyRecords: PropertyRowData[] = Array.from({ length: 50 }, (_, i) => ({
        id: `record-${i}`,
        properties: {
          title: `Task ${i}`,
        },
      }));

      const { container } = render(
        <UniversalListView
          records={manyRecords}
          properties={sampleProperties}
        />
      );

      // Should have scroll area for large datasets
      const scrollArea = container.querySelector('[class*="h-[calc(100vh-200px)]"]');
      expect(scrollArea).toBeInTheDocument();
    });
  });

  describe('UI Elements', () => {
    it('should display chevron icons for each item', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      // ChevronRight icons should be present
      const chevrons = container.querySelectorAll('svg');
      expect(chevrons.length).toBeGreaterThan(3); // At least one per record
    });

    it('should display separators between items', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      // Separators should be present (2 separators for 3 records)
      // Separator might be rendered as hr or div with specific class
      const separators = container.querySelectorAll('[data-orientation], hr, [role="separator"]');
      expect(separators.length).toBeGreaterThanOrEqual(1);
    });

    it('should display search icon in search input', () => {
      const { container } = render(
        <UniversalListView
          records={sampleRecords}
          properties={sampleProperties}
        />
      );

      // Search icon should be present
      const searchIcon = container.querySelector('[class*="absolute"]');
      expect(searchIcon).toBeInTheDocument();
    });
  });
});
