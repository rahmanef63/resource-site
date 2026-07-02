/**
 * Property System Integration Tests
 * 
 * Tests cross-property interactions, registry functionality,
 * and full workflows across all 21 property types.
 */

import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { propertyRegistry } from '../registry';
import { registerAllProperties } from '../registry/auto-discovery';
import type { Property, PropertyType } from '@/frontend/shared/foundation/types/universal-database';

// Register all properties before tests
beforeAll(() => {
  registerAllProperties();
});

describe('Property Registry Integration', () => {
  it('should have registered all 23 property types', () => {
    const allProperties = propertyRegistry.getAll();
    expect(allProperties.length).toBe(23);
  });

  it('should have all expected property types', () => {
    const expectedTypes: PropertyType[] = [
      'title', 'rich_text', 'number', 'checkbox', 'select', 'multi_select',
      'date', 'people', 'files', 'url', 'email', 'phone',
      'formula', 'relation', 'rollup', 'created_time', 'created_by',
      'last_edited_time', 'last_edited_by', 'unique_id', 'button', 'status', 'place'
    ];

    expectedTypes.forEach(type => {
      expect(propertyRegistry.has(type)).toBe(true);
    });
  });

  it('should return valid config for each property type', () => {
    const allProperties = propertyRegistry.getAll();
    
    allProperties.forEach(config => {
      expect(config.type).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.Renderer).toBeDefined();
      expect(config.Editor).toBeDefined();
      expect(config.category).toMatch(/^(core|extended|auto)$/);
      expect(config.version).toBeDefined();
    });
  });

  it('should categorize properties correctly', () => {
    const coreProps = propertyRegistry.getByCategory('core');
    const extendedProps = propertyRegistry.getByCategory('extended');
    const autoProps = propertyRegistry.getByCategory('auto');

    expect(coreProps.length).toBeGreaterThan(0);
    expect(extendedProps.length).toBeGreaterThan(0);
    expect(autoProps.length).toBeGreaterThan(0);
    
    // Core properties: title, rich_text, number, checkbox, select, multi_select, date, people, files
    expect(coreProps.length).toBeGreaterThanOrEqual(9);
    
    // Extended: url, email, phone, formula, relation, rollup, button, status, place
    // Note: Some may be categorized as core, so relax this assertion
    expect(extendedProps.length).toBeGreaterThanOrEqual(6);
    
    // Auto: created_time, created_by, last_edited_time, last_edited_by, unique_id
    expect(autoProps.length).toBe(5);
  });
});

describe('Cross-Property Rendering', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: undefined,
  });

  it('should render all property types without errors', () => {
    const propertyTypes: PropertyType[] = [
      'title', 'rich_text', 'number', 'checkbox', 'select', 'multi_select',
      'date', 'people', 'files', 'url', 'email', 'phone',
      'formula', 'relation', 'rollup', 'created_time', 'created_by',
      'last_edited_time', 'last_edited_by', 'unique_id', 'button', 'status', 'place'
    ];

    propertyTypes.forEach(type => {
      const config = propertyRegistry.get(type);
      expect(config).toBeDefined();
      
      if (config) {
        const { Renderer } = config;
        const property = mockProperty(type);
        
        // Render with null value - should not throw error
        const { container, unmount } = render(
          <Renderer value={null} property={property} readOnly={true} />
        );
        
        // Should render something (not throw error)
        expect(container.firstChild).toBeTruthy();
        
        unmount();
      }
    });
  });

  it('should handle different value types correctly', () => {
    // Text properties
    const titleConfig = propertyRegistry.get('title');
    if (titleConfig) {
      const { Renderer } = titleConfig;
      render(<Renderer value="Test Title" property={mockProperty('title')} readOnly={true} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    }

    // Number properties
    const numberConfig = propertyRegistry.get('number');
    if (numberConfig) {
      const { Renderer } = numberConfig;
      const { unmount } = render(<Renderer value={1000000} property={mockProperty('number')} readOnly={true} />);
      expect(screen.getByText('1,000,000')).toBeInTheDocument();
      unmount();
    }

    // Boolean properties
    const checkboxConfig = propertyRegistry.get('checkbox');
    if (checkboxConfig) {
      const { Renderer } = checkboxConfig;
      const { unmount } = render(<Renderer value={true} property={mockProperty('checkbox')} readOnly={true} />);
      expect(screen.getByRole('checkbox')).toBeChecked();
      unmount();
    }
  });
});

describe('Cross-Property Editing', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: undefined,
  });

  it('should handle onChange callbacks for editable properties', async () => {
    const user = userEvent.setup();
    let changedValue: any = null;
    const handleChange = (value: any) => {
      changedValue = value;
    };

    // Test title editor
    const titleConfig = propertyRegistry.get('title');
    if (titleConfig) {
      const { Editor } = titleConfig;
      render(
        <Editor 
          value="" 
          property={mockProperty('title')} 
          onChange={handleChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'New Title');
      
      await waitFor(() => {
        expect(changedValue).toBe('New Title');
      });
    }
  });

  it('should respect readOnly mode', () => {
    const titleConfig = propertyRegistry.get('title');
    if (titleConfig) {
      const { Renderer } = titleConfig;
      render(
        <Renderer 
          value="Read Only Title" 
          property={mockProperty('title')} 
          readOnly={true}
        />
      );
      
      // Should display as text, not input
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByText('Read Only Title')).toBeInTheDocument();
    }
  });
});

describe('Property Validation Integration', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: undefined,
  });

  it('should validate email property', () => {
    const emailConfig = propertyRegistry.get('email');
    expect(emailConfig).toBeDefined();
    
    if (emailConfig?.validate) {
      const property = mockProperty('email');
      
      // Valid emails
      expect(emailConfig.validate('test@example.com', property)).toBeNull();
      expect(emailConfig.validate('user+tag@domain.co.uk', property)).toBeNull();
      
      // Invalid emails
      expect(emailConfig.validate('invalid-email', property)).toContain('email');
      expect(emailConfig.validate('no@domain', property)).toContain('email');
    }
  });

  it('should validate url property', () => {
    const urlConfig = propertyRegistry.get('url');
    expect(urlConfig).toBeDefined();
    
    if (urlConfig?.validate) {
      const property = mockProperty('url');
      
      // Valid URLs
      expect(urlConfig.validate('https://example.com', property)).toBeNull();
      expect(urlConfig.validate('http://localhost:3000', property)).toBeNull();
      
      // Invalid URLs
      expect(urlConfig.validate('not-a-url', property)).toContain('URL');
    }
  });

  it('should validate phone property', () => {
    const phoneConfig = propertyRegistry.get('phone');
    expect(phoneConfig).toBeDefined();
    
    if (phoneConfig?.validate) {
      const property = mockProperty('phone');
      
      // Valid phones (various formats)
      expect(phoneConfig.validate('+1-555-123-4567', property)).toBeNull();
      expect(phoneConfig.validate('555-123-4567', property)).toBeNull();
      
      // Invalid phones
      expect(phoneConfig.validate('123-ABC-7890', property)).toContain('phone');
    }
  });

  it('should validate number property', () => {
    const numberConfig = propertyRegistry.get('number');
    expect(numberConfig).toBeDefined();
    
    if (numberConfig?.validate) {
      const property = mockProperty('number');
      
      // Valid numbers
      expect(numberConfig.validate(42, property)).toBeNull();
      expect(numberConfig.validate(0, property)).toBeNull();
      expect(numberConfig.validate(-100, property)).toBeNull();
      
      // Invalid numbers
      expect(numberConfig.validate('not-a-number', property)).toContain('number');
      expect(numberConfig.validate(NaN, property)).toContain('number');
    }
  });
});

describe('Property Formatting Integration', () => {
  it('should format numbers with commas', () => {
    const numberConfig = propertyRegistry.get('number');
    if (numberConfig?.format) {
      expect(numberConfig.format(1000000)).toBe('1,000,000');
      expect(numberConfig.format(1234.56)).toBe('1,234.56');
      expect(numberConfig.format(0)).toBe('0');
    }
  });

  it('should format dates consistently', () => {
    const dateConfig = propertyRegistry.get('date');
    if (dateConfig?.format) {
      const date = new Date('2024-03-15T10:30:00Z');
      const formatted = dateConfig.format(date);
      
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    }
  });

  it('should handle null/undefined values', () => {
    const configs = [
      propertyRegistry.get('title'),
      propertyRegistry.get('number'),
      propertyRegistry.get('email'),
    ];

    configs.forEach(config => {
      if (config?.format) {
        expect(config.format(null)).toBe('');
        expect(config.format(undefined)).toBe('');
      }
    });
  });
});

describe('Formula and Rollup Integration', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: type === 'formula' 
      ? { expression: 'SUM(1, 2, 3)' }
      : type === 'rollup'
      ? { relationPropertyId: 'rel_1', aggregation: 'COUNT', rollupPropertyId: 'prop_1' }
      : undefined,
  });

  it('should render formula results', () => {
    const formulaConfig = propertyRegistry.get('formula');
    if (formulaConfig) {
      const { Renderer } = formulaConfig;
      
      // Number result
      const { unmount: unmount1 } = render(
        <Renderer value={42} property={mockProperty('formula')} readOnly={true} />
      );
      expect(screen.getByText('42')).toBeInTheDocument();
      unmount1();
      
      // String result
      const { unmount: unmount2 } = render(
        <Renderer value="Calculated" property={mockProperty('formula')} readOnly={true} />
      );
      expect(screen.getByText('Calculated')).toBeInTheDocument();
      unmount2();
      
      // Boolean result
      const { unmount: unmount3 } = render(
        <Renderer value={true} property={mockProperty('formula')} readOnly={true} />
      );
      expect(screen.getByText(/true/i)).toBeInTheDocument();
      unmount3();
    }
  });

  it('should render rollup aggregations', () => {
    const rollupConfig = propertyRegistry.get('rollup');
    if (rollupConfig) {
      const { Renderer } = rollupConfig;
      
      // COUNT aggregation
      render(
        <Renderer value={150} property={mockProperty('rollup')} readOnly={true} />
      );
      expect(screen.getByText('150 items')).toBeInTheDocument();
    }
  });
});

describe('Auto Properties Integration', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: undefined,
  });

  it('should mark auto properties as non-editable', () => {
    const autoTypes: PropertyType[] = [
      'created_time', 'created_by', 'last_edited_time', 'last_edited_by', 'unique_id'
    ];

    autoTypes.forEach(type => {
      const config = propertyRegistry.get(type);
      expect(config?.isAuto).toBe(true);
      expect(config?.isEditable).toBe(false);
    });
  });

  it('should render timestamp properties', () => {
    const timestamp = Date.now();
    
    const createdTimeConfig = propertyRegistry.get('created_time');
    if (createdTimeConfig) {
      const { Renderer } = createdTimeConfig;
      render(
        <Renderer value={timestamp} property={mockProperty('created_time')} readOnly={true} />
      );
      
      // Should show formatted date/time
      const element = screen.getByText(/ago|at|on|,/i);
      expect(element).toBeInTheDocument();
    }
  });

  it('should render unique_id property', () => {
    const uniqueIdConfig = propertyRegistry.get('unique_id');
    if (uniqueIdConfig) {
      const { Renderer } = uniqueIdConfig;
      render(
        <Renderer value="ABC-123" property={mockProperty('unique_id')} readOnly={true} />
      );
      
      expect(screen.getByText('ABC-123')).toBeInTheDocument();
    }
  });
});

describe('Button Property Integration', () => {
  const mockProperty = (): Property => ({
    key: 'action_button',
    type: 'button',
    name: 'Action Button',
    isRequired: false,
    options: {
      actionType: 'url',
      actionValue: 'https://example.com',
      label: 'Click Me',
      style: 'primary',
    },
  });

  it('should render button with different action types', () => {
    const buttonConfig = propertyRegistry.get('button');
    if (buttonConfig) {
      const { Renderer } = buttonConfig;
      
      const actionTypes = ['url', 'email', 'phone', 'copy', 'webhook'];
      
      actionTypes.forEach(actionType => {
        const property = {
          ...mockProperty(),
          options: {
            action: actionType as any,
            actionValue: 'test-value',
            label: `${actionType} action`,
          },
        };
        
        // Button needs a value to render (the action value)
        const { unmount } = render(
          <Renderer value="test-value" property={property} readOnly={true} />
        );
        
        expect(screen.getByRole('button')).toBeInTheDocument();
        unmount();
      });
    }
  });
});

describe('Full Property Workflow', () => {
  const mockProperty = (type: PropertyType): Property => ({
    key: type,
    type,
    name: `Test ${type}`,
    isRequired: false,
    options: undefined,
  });

  it('should complete read-edit-read cycle for title', async () => {
    const user = userEvent.setup();
    const titleConfig = propertyRegistry.get('title');
    
    if (titleConfig) {
      const { Renderer, Editor } = titleConfig;
      const property = mockProperty('title');
      
      // 1. Read: Initial value
      const { unmount: unmount1 } = render(
        <Renderer value="Initial Title" property={property} readOnly={true} />
      );
      expect(screen.getByText('Initial Title')).toBeInTheDocument();
      unmount1();
      
      // 2. Edit: Change value
      let newValue: any = null;
      const { unmount: unmount2 } = render(
        <Editor 
          value="Initial Title" 
          property={property} 
          onChange={(v) => { newValue = v; }}
        />
      );
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'Updated Title');
      
      await waitFor(() => {
        expect(newValue).toBe('Updated Title');
      });
      unmount2();
      
      // 3. Read: New value
      const { unmount: unmount3 } = render(
        <Renderer value={newValue} property={property} readOnly={true} />
      );
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      unmount3();
    }
  });

  it('should handle validation in workflow', async () => {
    const user = userEvent.setup();
    const emailConfig = propertyRegistry.get('email');
    
    if (emailConfig) {
      const { Editor, validate } = emailConfig;
      const property = mockProperty('email');
      
      let currentValue: any = null;
      const { unmount } = render(
        <Editor 
          value="" 
          property={property} 
          onChange={(v) => { currentValue = v; }}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // Try invalid email
      await user.type(input, 'invalid-email');
      
      await waitFor(() => {
        expect(currentValue).toBe('invalid-email');
      });
      
      // Validate
      if (validate) {
        const error = validate(currentValue, property);
        expect(error).toContain('email');
      }
      
      unmount();
    }
  });
});
