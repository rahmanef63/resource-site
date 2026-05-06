/**
 * Tests for StudioErrorLogStore
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studioErrorLog } from '../studioErrorLog';

beforeEach(() => {
  studioErrorLog.clear();
});

describe('studioErrorLog', () => {
  describe('push', () => {
    it('adds an error entry with correct shape', () => {
      const err = new Error('test error');
      studioErrorLog.push('node-1', err);
      const errors = studioErrorLog.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        nodeId: 'node-1',
        message: 'test error',
      });
      expect(errors[0].id).toMatch(/^err-/);
      expect(errors[0].timestamp).toBeGreaterThan(0);
    });

    it('includes stack trace when available', () => {
      const err = new Error('stack test');
      studioErrorLog.push('node-2', err);
      const errors = studioErrorLog.getErrors();
      expect(errors[0].stack).toBeTruthy();
    });

    it('handles non-Error objects gracefully', () => {
      studioErrorLog.push('node-3', 'plain string error');
      const errors = studioErrorLog.getErrors();
      expect(errors[0].message).toBe('plain string error');
    });

    it('handles null/undefined errors', () => {
      studioErrorLog.push('node-4', null);
      const errors = studioErrorLog.getErrors();
      expect(errors[0].message).toBe('null');
    });

    it('prepends newest error first', () => {
      studioErrorLog.push('a', new Error('first'));
      studioErrorLog.push('b', new Error('second'));
      const errors = studioErrorLog.getErrors();
      expect(errors[0].nodeId).toBe('b');
      expect(errors[1].nodeId).toBe('a');
    });

    it('caps at 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        studioErrorLog.push(`node-${i}`, new Error(`err ${i}`));
      }
      expect(studioErrorLog.getErrors()).toHaveLength(100);
    });
  });

  describe('clear', () => {
    it('removes all errors', () => {
      studioErrorLog.push('x', new Error('a'));
      studioErrorLog.push('y', new Error('b'));
      studioErrorLog.clear();
      expect(studioErrorLog.getErrors()).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('calls listener on push', () => {
      const listener = vi.fn();
      const unsub = studioErrorLog.subscribe(listener);
      studioErrorLog.push('n', new Error('e'));
      expect(listener).toHaveBeenCalledTimes(1);
      unsub();
    });

    it('calls listener on clear', () => {
      const listener = vi.fn();
      const unsub = studioErrorLog.subscribe(listener);
      studioErrorLog.push('n', new Error('e'));
      studioErrorLog.clear();
      expect(listener).toHaveBeenCalledTimes(2);
      unsub();
    });

    it('stops calling listener after unsubscribe', () => {
      const listener = vi.fn();
      const unsub = studioErrorLog.subscribe(listener);
      unsub();
      studioErrorLog.push('n', new Error('e'));
      expect(listener).not.toHaveBeenCalled();
    });

    it('supports multiple independent listeners', () => {
      const a = vi.fn();
      const b = vi.fn();
      const unsubA = studioErrorLog.subscribe(a);
      const unsubB = studioErrorLog.subscribe(b);
      studioErrorLog.push('n', new Error('e'));
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
      unsubA();
      unsubB();
    });
  });

  describe('getErrors', () => {
    it('returns empty array initially', () => {
      expect(studioErrorLog.getErrors()).toEqual([]);
    });

    it('returns a stable snapshot', () => {
      studioErrorLog.push('n', new Error('e'));
      const a = studioErrorLog.getErrors();
      const b = studioErrorLog.getErrors();
      expect(a).toBe(b);
    });
  });
});
