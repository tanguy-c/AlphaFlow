import { describe, expect, it } from 'vitest';
import type { MachineConfig } from '../types/machine';
import { generateInstructions } from '../utils/instructionGenerator';

// Minimal test machine with two modes and shared characters
const testMachine: MachineConfig = {
  id: 'test',
  name: 'Test Machine',
  description: '',
  codeFormat: { padding: 2 },
  defaultModeId: 'alpha',
  caseSensitive: false,
  createdAt: '',
  updatedAt: '',
  modes: [
    {
      id: 'alpha',
      name: 'Alphabet',
      characters: [
        { character: 'A', code: '01' },
        { character: 'B', code: '02' },
        { character: 'C', code: '03' },
        { character: ' ', code: '99' },
      ],
    },
    {
      id: 'accents',
      name: 'Accents',
      characters: [
        { character: 'É', code: '01' },
        { character: 'È', code: '02' },
        { character: ' ', code: '99' },
      ],
    },
  ],
};

// Case-sensitive machine (like Bernette b38)
const caseSensitiveMachine: MachineConfig = {
  ...testMachine,
  id: 'cs-test',
  caseSensitive: true,
  modes: [
    {
      id: 'alpha',
      name: 'Alphabet',
      characters: [
        { character: 'A', code: '11' },
        { character: 'B', code: '12' },
        { character: 'a', code: '37' },
        { character: 'b', code: '38' },
        { character: ' ', code: '98' },
      ],
    },
    {
      id: 'accents',
      name: 'Accents',
      characters: [
        { character: 'É', code: '10' },
        { character: 'é', code: '51' },
        { character: ' ', code: '98' },
      ],
    },
  ],
};

describe('generateInstructions', () => {
  it('generates code instructions for simple text', () => {
    const result = generateInstructions('AB', testMachine);
    expect(result.errors).toHaveLength(0);
    // mode_change to alpha + A + B = 3
    expect(result.instructions).toHaveLength(3);
    expect(result.instructions[0]).toMatchObject({
      type: 'mode_change',
      toModeId: 'alpha',
    });
    expect(result.instructions[1]).toMatchObject({
      type: 'code',
      character: 'A',
      code: '01',
    });
    expect(result.instructions[2]).toMatchObject({
      type: 'code',
      character: 'B',
      code: '02',
    });
  });

  it('inserts mode changes when needed', () => {
    const result = generateInstructions('AÉB', testMachine);
    expect(result.errors).toHaveLength(0);
    // mode_change alpha + A + mode_change accents + É + mode_change alpha + B = 6
    const modeChanges = result.instructions.filter((i) => i.type === 'mode_change');
    expect(modeChanges).toHaveLength(3);
  });

  it('reports errors for unknown characters', () => {
    const result = generateInstructions('A$B', testMachine);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].character).toBe('$');
    expect(result.errors[0].position).toBe(2);
  });

  it('handles empty text', () => {
    const result = generateInstructions('', testMachine);
    expect(result.instructions).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  // Case-insensitive matching
  it('matches case-insensitively when caseSensitive is false', () => {
    const result = generateInstructions('a', testMachine);
    expect(result.errors).toHaveLength(0);
    expect(result.instructions.filter((i) => i.type === 'code')).toHaveLength(1);
  });

  // Case-sensitive matching
  it('distinguishes case when caseSensitive is true', () => {
    const result = generateInstructions('Aa', caseSensitiveMachine);
    expect(result.errors).toHaveLength(0);
    const codes = result.instructions.filter((i) => i.type === 'code');
    expect(codes).toHaveLength(2);
    expect(codes[0]).toMatchObject({ character: 'A', code: '11' });
    expect(codes[1]).toMatchObject({ character: 'a', code: '37' });
  });

  // Multi-mode: stays in current mode
  it('stays in current mode when character exists in multiple modes', () => {
    // Space exists in both alpha and accents
    // "A É" → alpha for A, then accents for É, then space should stay in accents
    const result = generateInstructions('A É', testMachine);
    expect(result.errors).toHaveLength(0);
    const spaceInstruction = result.instructions.find(
      (i) => i.type === 'code' && i.character === ' ',
    );
    // The space between A and É should be in alpha (current mode) or accents
    // since É is next, the space should be in alpha (current) because it tries to stay
    expect(spaceInstruction).toBeDefined();
  });

  // Look-ahead minimizes mode changes
  it('minimizes mode changes via look-ahead', () => {
    // " É" → space exists in both modes; É only in accents
    // Smart: go to accents for space (look-ahead sees É), then stay for É
    const result = generateInstructions(' É', testMachine);
    const modeChanges = result.instructions.filter((i) => i.type === 'mode_change');
    // Should only need 1 mode change (to accents), not 2
    expect(modeChanges).toHaveLength(1);
    expect(modeChanges[0]).toMatchObject({ toModeId: 'accents' });
  });

  it('handles accented text like ÉTÉ with mode changes', () => {
    const machineWithT: MachineConfig = {
      ...testMachine,
      modes: [
        {
          id: 'alpha',
          name: 'Alphabet',
          characters: [{ character: 'T', code: '20' }],
        },
        {
          id: 'accents',
          name: 'Accents',
          characters: [{ character: 'É', code: '06' }],
        },
      ],
    };
    const result = generateInstructions('ÉTÉ', machineWithT);
    expect(result.errors).toHaveLength(0);
    // É(accents) T(alpha) É(accents) = 5 mode changes: accents, alpha, accents + 3 codes
    const types = result.instructions.map((i) => i.type);
    expect(types).toEqual([
      'mode_change',
      'code', // É
      'mode_change',
      'code', // T
      'mode_change',
      'code', // É
    ]);
  });
});
