export type InstructionType = 'code' | 'mode_change';

export interface CodeInstruction {
  type: 'code';
  character: string;
  code: string;
  modeId: string;
  modeName: string;
}

export interface ModeChangeInstruction {
  type: 'mode_change';
  fromModeId: string | null;
  fromModeName: string | null;
  toModeId: string;
  toModeName: string;
}

export type Instruction = CodeInstruction | ModeChangeInstruction;

export interface GenerationResult {
  instructions: Instruction[];
  errors: GenerationError[];
}

export interface GenerationError {
  character: string;
  position: number;
  message: string;
}
