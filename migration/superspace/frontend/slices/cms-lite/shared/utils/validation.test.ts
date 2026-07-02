import { describe, it, expect } from 'vitest';
import {
  required,
  minLength,
  maxLength,
  email,
  url,
  slug,
  min,
  max,
  pattern,
  validateForm,
  isFormValid,
} from './validation';

describe('Validation Utilities', () => {
  describe('required', () => {
    it('should validate non-empty strings', () => {
      const rule = required();
      expect(rule.validate('test')).toBe(true);
      expect(rule.validate('   ')).toBe(false);
      expect(rule.validate('')).toBe(false);
    });

    it('should validate non-empty arrays', () => {
      const rule = required();
      expect(rule.validate([1, 2, 3])).toBe(true);
      expect(rule.validate([])).toBe(false);
    });

    it('should validate non-null values', () => {
      const rule = required();
      expect(rule.validate(0)).toBe(true);
      expect(rule.validate(false)).toBe(true);
      expect(rule.validate(null)).toBe(false);
      expect(rule.validate(undefined)).toBe(false);
    });

    it('should use custom message', () => {
      const rule = required('Custom message');
      expect(rule.message).toBe('Custom message');
    });
  });

  describe('minLength', () => {
    it('should validate minimum length', () => {
      const rule = minLength(5);
      expect(rule.validate('12345')).toBe(true);
      expect(rule.validate('123456')).toBe(true);
      expect(rule.validate('1234')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = minLength(5);
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });

    it('should use custom message', () => {
      const rule = minLength(5, 'Too short');
      expect(rule.message).toBe('Too short');
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length', () => {
      const rule = maxLength(5);
      expect(rule.validate('12345')).toBe(true);
      expect(rule.validate('1234')).toBe(true);
      expect(rule.validate('123456')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = maxLength(5);
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });
  });

  describe('email', () => {
    it('should validate email addresses', () => {
      const rule = email();
      expect(rule.validate('test@example.com')).toBe(true);
      expect(rule.validate('user+tag@domain.co.uk')).toBe(true);
      expect(rule.validate('invalid')).toBe(false);
      expect(rule.validate('invalid@')).toBe(false);
      expect(rule.validate('@domain.com')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = email();
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });
  });

  describe('url', () => {
    it('should validate URLs', () => {
      const rule = url();
      expect(rule.validate('https://example.com')).toBe(true);
      expect(rule.validate('http://localhost:3000')).toBe(true);
      expect(rule.validate('ftp://files.example.com')).toBe(true);
      expect(rule.validate('invalid-url')).toBe(false);
      expect(rule.validate('not a url')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = url();
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });
  });

  describe('slug', () => {
    it('should validate slug format', () => {
      const rule = slug();
      expect(rule.validate('hello-world')).toBe(true);
      expect(rule.validate('my-blog-post-123')).toBe(true);
      expect(rule.validate('simple')).toBe(true);
      expect(rule.validate('Hello-World')).toBe(false);
      expect(rule.validate('hello_world')).toBe(false);
      expect(rule.validate('hello world')).toBe(false);
      expect(rule.validate('-leading-dash')).toBe(false);
      expect(rule.validate('trailing-dash-')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = slug();
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });
  });

  describe('min', () => {
    it('should validate minimum value', () => {
      const rule = min(10);
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(15)).toBe(true);
      expect(rule.validate(5)).toBe(false);
    });

    it('should allow null and undefined', () => {
      const rule = min(10);
      expect(rule.validate(null)).toBe(true);
      expect(rule.validate(undefined)).toBe(true);
    });
  });

  describe('max', () => {
    it('should validate maximum value', () => {
      const rule = max(10);
      expect(rule.validate(10)).toBe(true);
      expect(rule.validate(5)).toBe(true);
      expect(rule.validate(15)).toBe(false);
    });

    it('should allow null and undefined', () => {
      const rule = max(10);
      expect(rule.validate(null)).toBe(true);
      expect(rule.validate(undefined)).toBe(true);
    });
  });

  describe('pattern', () => {
    it('should validate custom patterns', () => {
      const rule = pattern(/^\d{3}-\d{3}-\d{4}$/);
      expect(rule.validate('123-456-7890')).toBe(true);
      expect(rule.validate('123-456-789')).toBe(false);
      expect(rule.validate('abc-def-ghij')).toBe(false);
    });

    it('should allow empty values', () => {
      const rule = pattern(/^\d+$/);
      expect(rule.validate('')).toBe(true);
      expect(rule.validate(null)).toBe(true);
    });

    it('should use custom message', () => {
      const rule = pattern(/^\d+$/, 'Numbers only');
      expect(rule.message).toBe('Numbers only');
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const data = {
        username: 'john',
        email: 'john@example.com',
        age: 25,
      };

      const rules = {
        username: [required(), minLength(3)],
        email: [required(), email()],
        age: [required(), min(18)],
      };

      const errors = validateForm(data, rules);
      expect(errors).toEqual({});
    });

    it('should return errors for invalid data', () => {
      const data = {
        username: 'jo',
        email: 'invalid-email',
        age: 15,
      };

      const rules = {
        username: [required(), minLength(3)],
        email: [required(), email()],
        age: [required(), min(18)],
      };

      const errors = validateForm(data, rules);
      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.age).toBeDefined();
    });

    it('should stop at first error for each field', () => {
      const data = {
        username: '',
      };

      const rules = {
        username: [required('Required'), minLength(3, 'Too short')],
      };

      const errors = validateForm(data, rules);
      expect(errors.username).toBe('Required');
    });

    it('should handle missing fields', () => {
      const data = {};

      const rules = {
        username: [required()],
        email: [required()],
      };

      const errors = validateForm(data, rules);
      expect(errors.username).toBeDefined();
      expect(errors.email).toBeDefined();
    });
  });

  describe('isFormValid', () => {
    it('should return true for empty errors', () => {
      expect(isFormValid({})).toBe(true);
    });

    it('should return false for errors', () => {
      expect(isFormValid({ username: 'Required' })).toBe(false);
    });
  });
});
