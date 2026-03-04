import type { GenerationError, GenerationResult, Instruction } from '../types/instruction';
import type { CharacterMapping, MachineConfig, MachineMode } from '../types/machine';

interface CharMatch {
  mode: MachineMode;
  mapping: CharacterMapping;
}

/**
 * Find ALL modes that contain a given character.
 * Respects the caseSensitive flag on the machine config.
 */
function findAllMatches(config: MachineConfig, char: string): CharMatch[] {
  const matches: CharMatch[] = [];
  const sensitive = config.caseSensitive ?? false;

  for (const mode of config.modes) {
    const mapping = mode.characters.find((m) =>
      sensitive ? m.character === char : m.character.toUpperCase() === char.toUpperCase(),
    );
    if (mapping) {
      matches.push({ mode, mapping });
    }
  }
  return matches;
}

/**
 * Pick the best mode for a character from a list of candidate matches.
 *
 * Priority order:
 *   1. Current mode (no mode change needed)
 *   2. The mode of the *next* character (minimises future mode changes)
 *   3. First available match (fallback)
 */
function pickBestMatch(
  matches: CharMatch[],
  currentModeId: string | null,
  nextCharMatches: CharMatch[],
): CharMatch {
  // 1. Stay in the current mode if possible
  if (currentModeId) {
    const sameMode = matches.find((m) => m.mode.id === currentModeId);
    if (sameMode) return sameMode;
  }

  // 2. Prefer a mode that will also contain the next character
  if (nextCharMatches.length > 0) {
    const nextModeIds = new Set(nextCharMatches.map((m) => m.mode.id));
    const shared = matches.find((m) => nextModeIds.has(m.mode.id));
    if (shared) return shared;
  }

  // 3. Fallback to the first match
  return matches[0];
}

/**
 * Generate instructions from a text string using a machine configuration.
 * Supports case-sensitive machines and characters present in multiple modes.
 * Minimises mode changes via look-ahead.
 */
export function generateInstructions(text: string, config: MachineConfig): GenerationResult {
  const instructions: Instruction[] = [];
  const errors: GenerationError[] = [];

  let currentModeId: string | null = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const matches = findAllMatches(config, char);

    if (matches.length === 0) {
      errors.push({
        character: char,
        position: i + 1,
        message: `Character "${char}" not found in any mode`,
      });
      continue;
    }

    // Look ahead: find matches for the next character (if any)
    let nextCharMatches: CharMatch[] = [];
    for (let j = i + 1; j < text.length; j++) {
      const nextMatches = findAllMatches(config, text[j]);
      if (nextMatches.length > 0) {
        nextCharMatches = nextMatches;
        break;
      }
    }

    const best = pickBestMatch(matches, currentModeId, nextCharMatches);
    const { mode, mapping } = best;

    // Insert mode change if needed
    if (currentModeId !== mode.id) {
      const fromMode = currentModeId ? config.modes.find((m) => m.id === currentModeId) : null;

      instructions.push({
        type: 'mode_change',
        fromModeId: currentModeId,
        fromModeName: fromMode?.name || null,
        toModeId: mode.id,
        toModeName: mode.name,
      });

      currentModeId = mode.id;
    }

    // Add code instruction
    instructions.push({
      type: 'code',
      character: mapping.character,
      code: mapping.code,
      modeId: mode.id,
      modeName: mode.name,
    });
  }

  return { instructions, errors };
}

/**
 * Extract only the code instructions (characters) from a list of instructions,
 * useful for showing context (previous/next characters).
 */
export function getCodeInstructions(instructions: Instruction[]) {
  return instructions.filter((i) => i.type === 'code') as Array<
    Extract<Instruction, { type: 'code' }>
  >;
}

/**
 * Get context characters around a given step index.
 */
export function getStepContext(
  instructions: Instruction[],
  stepIndex: number,
  contextSize: number = 3,
): { before: string[]; after: string[] } {
  const codeInstructions = getCodeInstructions(instructions);

  // Find how many code instructions are before stepIndex
  let codeIndex = 0;
  for (let i = 0; i < stepIndex; i++) {
    if (instructions[i].type === 'code') {
      codeIndex++;
    }
  }

  // If current step is not a code instruction, use previous code index
  const isCode = instructions[stepIndex]?.type === 'code';
  const currentCodeIndex = isCode ? codeIndex : codeIndex;

  const before: string[] = [];
  const after: string[] = [];

  for (let i = Math.max(0, currentCodeIndex - contextSize); i < currentCodeIndex; i++) {
    before.push(codeInstructions[i].character);
  }

  const startAfter = isCode ? currentCodeIndex + 1 : currentCodeIndex;
  for (let i = startAfter; i < Math.min(codeInstructions.length, startAfter + contextSize); i++) {
    after.push(codeInstructions[i].character);
  }

  return { before, after };
}
