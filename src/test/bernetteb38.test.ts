import { describe, expect, it } from 'vitest';
import bernetteb38Json from '../data/machines/bernette-b38.json';
import type { MachineConfig } from '../types/machine';

const bernetteb38 = bernetteb38Json as MachineConfig;

describe('Bernette b38 profile', () => {
  it('has correct metadata', () => {
    expect(bernetteb38.id).toBe('bernette-b38');
    expect(bernetteb38.name).toBe('Bernette b38');
    expect(bernetteb38.caseSensitive).toBe(true);
  });

  it('has 3 modes', () => {
    expect(bernetteb38.modes).toHaveLength(3);
  });

  it('Mode 4 Alphabet has uppercase and lowercase letters', () => {
    const mode4 = bernetteb38.modes.find((m) => m.id === 'mode4')!;
    expect(mode4).toBeDefined();
    const chars = mode4.characters.map((c) => c.character);
    expect(chars).toContain('A');
    expect(chars).toContain('a');
    expect(chars).toContain('Z');
    expect(chars).toContain('z');
  });

  it('Mode 4 has digits 0-9', () => {
    const mode4 = bernetteb38.modes.find((m) => m.id === 'mode4')!;
    const chars = mode4.characters.map((c) => c.character);
    for (const d of '0123456789'.split('')) {
      expect(chars).toContain(d);
    }
  });

  it('Mode 5 has accented characters', () => {
    const mode5 = bernetteb38.modes.find((m) => m.id === 'mode5')!;
    expect(mode5).toBeDefined();
    const chars = mode5.characters.map((c) => c.character);
    expect(chars).toContain('À');
    expect(chars).toContain('É');
    expect(chars).toContain('é');
    expect(chars).toContain('Ç');
  });

  it('Mode 6 has Cyrillic characters', () => {
    const mode6 = bernetteb38.modes.find((m) => m.id === 'mode6')!;
    expect(mode6).toBeDefined();
    const chars = mode6.characters.map((c) => c.character);
    expect(chars).toContain('А');
    expect(chars).toContain('Б');
    expect(chars).toContain('я');
  });

  it('Mode 6 matches the corrected guide positions for extended Cyrillic', () => {
    const mode6 = bernetteb38.modes.find((m) => m.id === 'mode6')!;
    const byCode = new Map(mode6.characters.map((c) => [c.code, c.character]));

    expect(byCode.get('40')).toBe('Ц');
    expect(byCode.get('42')).toBe('Щ');
    expect(byCode.get('55')).toBe('ѓ');
    expect(byCode.get('62')).toBe('ѕ');
    expect(byCode.get('66')).toBe('й');
    expect(byCode.get('67')).toBe('ѝ');
    expect(byCode.get('68')).toBe('ј');
    expect(byCode.get('88')).toBe('ц');
    expect(byCode.get('90')).toBe('щ');
    expect(byCode.get('96')).toBe('я');
  });

  it('has no duplicate codes within any mode', () => {
    for (const mode of bernetteb38.modes) {
      const codes = mode.characters.map((c) => c.code);
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    }
  });

  it('space character exists in all modes', () => {
    for (const mode of bernetteb38.modes) {
      const hasSpace = mode.characters.some((c) => c.character === ' ');
      expect(hasSpace).toBe(true);
    }
  });

  it('defaultModeId references an existing mode', () => {
    const ids = bernetteb38.modes.map((m) => m.id);
    expect(ids).toContain(bernetteb38.defaultModeId);
  });
});
