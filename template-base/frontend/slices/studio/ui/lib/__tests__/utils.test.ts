/**
 * Tests for studio/ui/lib/utils — ensures re-exports from global lib work
 * and that layout helper functions behave correctly.
 */
import { describe, it, expect } from 'vitest';
import {
  cn,
  uid,
  clamp,
  generateContainerClasses,
  generateRowClasses,
  generateColumnClasses,
  generateSectionClasses,
} from '../utils';

describe('re-exports from global lib/utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('a', 'b')).toBe('a b');
    });

    it('filters falsy values', () => {
      expect(cn('a', undefined, null as any, false as any, 'b')).toBe('a b');
    });

    it('resolves Tailwind conflicts (twMerge)', () => {
      // twMerge resolves conflicting Tailwind classes
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });
  });

  describe('uid', () => {
    it('returns a string', () => {
      expect(typeof uid()).toBe('string');
    });

    it('returns unique values', () => {
      const ids = new Set(Array.from({ length: 100 }, () => uid()));
      expect(ids.size).toBe(100);
    });
  });

  describe('clamp', () => {
    it('clamps below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('clamps above max', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
  });
});

describe('generateContainerClasses', () => {
  it('returns empty string for empty props', () => {
    expect(generateContainerClasses({})).toBe('');
  });

  it('adds max-width class', () => {
    expect(generateContainerClasses({ maxWidth: 'lg' })).toContain('max-w-lg');
  });

  it('adds padding class', () => {
    expect(generateContainerClasses({ padding: '4' })).toContain('p-4');
  });

  it('adds custom className', () => {
    expect(generateContainerClasses({ className: 'my-custom' })).toContain('my-custom');
  });
});

describe('generateRowClasses', () => {
  it('always includes flex', () => {
    expect(generateRowClasses({})).toContain('flex');
  });

  it('adds gap class', () => {
    expect(generateRowClasses({ gap: '4' })).toContain('gap-4');
  });

  it('adds justify-content class', () => {
    expect(generateRowClasses({ justifyContent: 'center' })).toContain('justify-center');
  });

  it('adds align-items class', () => {
    expect(generateRowClasses({ alignItems: 'start' })).toContain('items-start');
  });
});

describe('generateColumnClasses', () => {
  it('always includes flex and flex-col', () => {
    const classes = generateColumnClasses({});
    expect(classes).toContain('flex');
    expect(classes).toContain('flex-col');
  });

  it('adds width class', () => {
    expect(generateColumnClasses({ width: 'full' })).toContain('w-full');
  });
});

describe('generateSectionClasses', () => {
  it('returns empty string for empty props', () => {
    expect(generateSectionClasses({})).toBe('');
  });

  it('adds padding class', () => {
    expect(generateSectionClasses({ padding: '8' })).toContain('p-8');
  });

  it('adds min-height class', () => {
    expect(generateSectionClasses({ minHeight: 'screen' })).toContain('min-h-screen');
  });
});
