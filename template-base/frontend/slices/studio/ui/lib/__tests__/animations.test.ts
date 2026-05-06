/**
 * Tests for Studio Animation Presets
 */
import { describe, it, expect } from 'vitest';
import {
  ANIMATION_PRESETS,
  ANIMATION_PRESET_KEYS,
  EASING_OPTIONS,
  ANIMATION_INSPECTOR_FIELDS,
} from '../animations';

describe('ANIMATION_PRESETS', () => {
  it('exports the expected preset names', () => {
    const expected = [
      'none', 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight',
      'scaleIn', 'scaleUp', 'slideUp', 'bounceIn', 'rotateIn',
      'flipX', 'flipY', 'blur', 'pulse', 'shake', 'wiggle', 'float', 'typewriter',
    ];
    for (const key of expected) {
      expect(ANIMATION_PRESETS).toHaveProperty(key);
    }
  });

  it('each preset (except none) has hidden and visible variants', () => {
    for (const [key, variants] of Object.entries(ANIMATION_PRESETS)) {
      if (key === 'none') continue;
      expect(variants).toHaveProperty('hidden');
      expect(variants).toHaveProperty('visible');
    }
  });

  it('none preset is an empty object', () => {
    expect(ANIMATION_PRESETS.none).toEqual({});
  });

  it('fadeIn hidden state has opacity 0', () => {
    expect((ANIMATION_PRESETS.fadeIn.hidden as any).opacity).toBe(0);
  });

  it('fadeUp hidden state has negative y offset', () => {
    const hidden = ANIMATION_PRESETS.fadeUp.hidden as any;
    expect(hidden.y).toBeGreaterThan(0);
    expect(hidden.opacity).toBe(0);
  });

  it('scaleIn hidden state has scale below 1', () => {
    const hidden = ANIMATION_PRESETS.scaleIn.hidden as any;
    expect(hidden.scale).toBeLessThan(1);
  });

  it('bounceIn visible state has spring transition', () => {
    const visible = ANIMATION_PRESETS.bounceIn.visible as any;
    expect(visible.transition?.type).toBe('spring');
  });

  it('blur preset includes filter property', () => {
    const hidden = ANIMATION_PRESETS.blur.hidden as any;
    expect(hidden.filter).toContain('blur');
  });
});

describe('ANIMATION_PRESET_KEYS', () => {
  it('is an array of all preset names', () => {
    expect(ANIMATION_PRESET_KEYS).toEqual(Object.keys(ANIMATION_PRESETS));
  });

  it('includes none as first or present item', () => {
    expect(ANIMATION_PRESET_KEYS).toContain('none');
  });
});

describe('EASING_OPTIONS', () => {
  it('includes standard easing values', () => {
    expect(EASING_OPTIONS).toContain('easeOut');
    expect(EASING_OPTIONS).toContain('easeIn');
    expect(EASING_OPTIONS).toContain('easeInOut');
    expect(EASING_OPTIONS).toContain('linear');
  });
});

describe('ANIMATION_INSPECTOR_FIELDS', () => {
  it('has 5 inspector field definitions', () => {
    expect(ANIMATION_INSPECTOR_FIELDS).toHaveLength(5);
  });

  it('first field is animation select', () => {
    const first = ANIMATION_INSPECTOR_FIELDS[0];
    expect(first.key).toBe('animation');
    expect(first.type).toBe('select');
  });

  it('all fields have key and type', () => {
    for (const field of ANIMATION_INSPECTOR_FIELDS) {
      expect(field.key).toBeTruthy();
      expect(field.type).toBeTruthy();
    }
  });

  it('animation field options match ANIMATION_PRESET_KEYS', () => {
    const animField = ANIMATION_INSPECTOR_FIELDS.find((f) => f.key === 'animation');
    expect((animField as any).options).toEqual(ANIMATION_PRESET_KEYS);
  });
});
