import { describe, expect, it } from 'vitest';
import { parseConfigFile } from '../utils/importExport';

describe('parseConfigFile', () => {
  const validConfig = {
    id: 'test-id',
    name: 'Test Machine',
    description: 'A test machine',
    codeFormat: { padding: 2 },
    defaultModeId: 'mode1',
    modes: [
      {
        id: 'mode1',
        name: 'Mode 1',
        characters: [{ character: 'A', code: '01' }],
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('parses a valid configuration', () => {
    const json = JSON.stringify(validConfig);
    const result = parseConfigFile(json);
    expect(result.id).toBe('test-id');
    expect(result.name).toBe('Test Machine');
    expect(result.modes).toHaveLength(1);
    expect(result.modes[0].characters[0]).toEqual({ character: 'A', code: '01' });
  });

  it('throws on missing id', () => {
    const invalid = { ...validConfig, id: undefined };
    expect(() => parseConfigFile(JSON.stringify(invalid))).toThrow('id');
  });

  it('throws on missing name', () => {
    const invalid = { ...validConfig, name: '' };
    expect(() => parseConfigFile(JSON.stringify(invalid))).toThrow('name');
  });

  it('throws on empty modes', () => {
    const invalid = { ...validConfig, modes: [] };
    expect(() => parseConfigFile(JSON.stringify(invalid))).toThrow('modes');
  });

  it('throws on invalid character mapping', () => {
    const invalid = {
      ...validConfig,
      modes: [
        {
          id: 'mode1',
          name: 'Mode 1',
          characters: [{ character: 'A', code: 42 }], // code should be string
        },
      ],
    };
    expect(() => parseConfigFile(JSON.stringify(invalid))).toThrow('Invalid character');
  });

  it('throws on invalid JSON', () => {
    expect(() => parseConfigFile('not json')).toThrow();
  });

  it('adds default codeFormat if missing', () => {
    const noFormat = { ...validConfig, codeFormat: undefined };
    const result = parseConfigFile(JSON.stringify(noFormat));
    expect(result.codeFormat).toEqual({ padding: 2 });
  });
});
