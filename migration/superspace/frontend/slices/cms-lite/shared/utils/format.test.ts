import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatCurrency,
  formatNumber,
  truncate,
  slugify,
  capitalize,
  pluralize,
} from './format';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date, 'en-US');
      expect(formatted).toMatch(/Jan.*15.*2024/);
    });

    it('should handle different locales', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date, 'pt-BR');
      expect(formatted).toContain('2024');
    });

    it('should format date strings', () => {
      const formatted = formatDate('2024-01-15', 'en-US');
      expect(formatted).toMatch(/Jan.*15.*2024/);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default settings', () => {
      const formatted = formatCurrency(1234.56);
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('56');
    });

    it('should format currency with different currency codes', () => {
      const formatted = formatCurrency(1234.56, 'en-US', 'USD');
      expect(formatted).toMatch(/\$.*1.*234.*56/);
    });

    it('should format currency with different locales', () => {
      const formatted = formatCurrency(1234.56, 'pt-BR', 'BRL');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toMatch(/0/);
    });

    it('should handle negative values', () => {
      const formatted = formatCurrency(-100);
      expect(formatted).toContain('100');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with default settings', () => {
      expect(formatNumber(1234567)).toMatch(/1.*234.*567/);
    });

    it('should format decimals', () => {
      const formatted = formatNumber(1234.56789, 'en-US', 2);
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
      expect(formatted).toContain('57');
    });

    it('should format with different locales', () => {
      const formatted = formatNumber(1234.56, 'pt-BR');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncate(text, 20);
      expect(result.length).toBeLessThanOrEqual(23);
      expect(result).toContain('...');
    });

    it('should not truncate short strings', () => {
      const text = 'Short';
      const result = truncate(text, 20);
      expect(result).toBe(text);
    });

    it('should use custom suffix', () => {
      const text = 'This is a very long text';
      const result = truncate(text, 10, '…');
      expect(result).toContain('…');
      expect(result).not.toContain('...');
    });

    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('my blog post')).toBe('my-blog-post');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Test@Post#123')).toBe('testpost123');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('hello    world')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('  hello world  ')).toBe('hello-world');
    });

    it('should handle accented characters', () => {
      expect(slugify('Café')).toBe('cafe');
      expect(slugify('naïve')).toBe('naive');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should not affect rest of string', () => {
      expect(capitalize('hELLO')).toBe('HELLO');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('pluralize', () => {
    it('should use plural for multiple items', () => {
      expect(pluralize(2, 'item')).toBe('items');
      expect(pluralize(5, 'post')).toBe('posts');
    });

    it('should use singular for one item', () => {
      expect(pluralize(1, 'item')).toBe('item');
    });

    it('should use singular for zero by default', () => {
      expect(pluralize(0, 'item')).toBe('items');
    });

    it('should use custom plural form', () => {
      expect(pluralize(2, 'person', 'people')).toBe('people');
      expect(pluralize(1, 'person', 'people')).toBe('person');
    });

    it('should handle irregular plurals', () => {
      expect(pluralize(2, 'child', 'children')).toBe('children');
      expect(pluralize(3, 'mouse', 'mice')).toBe('mice');
    });
  });
});
